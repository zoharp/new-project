#!/usr/bin/env python3
"""
Auto-recording scenario recorder.
Opens a browser, captures all user interactions automatically.
Usage: python scripts/record_scenario.py <scenario_name> [start_url]
"""

import asyncio
import json
import sys
import os
from pathlib import Path
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Injected into every page to capture user interactions
_RECORDER_JS = """
(function() {
    if (window.__orcanosRecorder) return;
    window.__orcanosRecorder = true;

    function bestSelector(el) {
        if (el.id && !/^\\d/.test(el.id)) return '#' + el.id;
        const name = el.getAttribute('name');
        if (name) return el.tagName.toLowerCase() + '[name="' + name + '"]';
        const ariaLabel = el.getAttribute('aria-label');
        if (ariaLabel) return el.tagName.toLowerCase() + '[aria-label="' + ariaLabel + '"]';
        const dataAction = el.getAttribute('data-action') || el.getAttribute('data-id');
        if (dataAction) return el.tagName.toLowerCase() + '[data-action="' + dataAction + '"]';
        if ((el.tagName === 'BUTTON' || el.tagName === 'A') && el.textContent.trim()) {
            return el.tagName.toLowerCase() + ':has-text("' + el.textContent.trim().slice(0, 40).replace(/"/g, "'") + '")';
        }
        if (el.className && typeof el.className === 'string') {
            const cls = el.className.trim().split(/\\s+/)
                .filter(c => c.length > 2 && !/^(ng-|active|focus|hover|open|show|selected)/.test(c))
                .slice(0, 2).join('.');
            if (cls) return el.tagName.toLowerCase() + '.' + cls;
        }
        return el.tagName.toLowerCase();
    }

    function label(el, data) {
        return el.getAttribute('placeholder') || el.getAttribute('aria-label') ||
               el.getAttribute('name') || el.textContent.trim().slice(0, 40) || data.selector;
    }

    // Clicks on interactive elements
    document.addEventListener('click', function(e) {
        const el = e.target.closest('button, a, [role="button"], [role="link"], input[type="submit"], input[type="button"], input[type="checkbox"], input[type="radio"]') || e.target;
        if (!el || ['HTML','BODY','INPUT','TEXTAREA','SELECT'].includes(el.tagName)) return;
        const sel = bestSelector(el);
        const lbl = el.textContent.trim().slice(0, 50) || el.getAttribute('aria-label') || el.getAttribute('title') || sel;
        window.__recordAction({ type: 'click', selector: sel, label: lbl });
    }, true);

    // Fill inputs on blur (captures final value, not every keystroke)
    document.addEventListener('blur', function(e) {
        const el = e.target;
        if (!el || (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA')) return;
        if (el.type === 'submit' || el.type === 'button') return;
        if (!el.value) return;
        const sel = bestSelector(el);
        const isPassword = el.type === 'password';
        const isEmail = el.type === 'email' || (el.name || '').toLowerCase().includes('email') || (el.id || '').toLowerCase().includes('email');
        window.__recordAction({
            type: 'fill',
            selector: sel,
            value: isPassword ? '{{PASSWORD}}' : (isEmail ? '{{USER}}' : el.value),
            label: label(el, { selector: sel })
        });
    }, true);

    console.log('[Orcanos Recorder] Active');
})();
"""


async def _record(scenario_name: str, start_url: str, output_dir: str):
    steps = []
    prev_url = [None]

    from playwright.async_api import async_playwright

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context()

        # Expose Python callback to every page before their scripts run
        async def on_action(source, data):
            t = data.get('type', '')
            sel = data.get('selector', '')
            lbl = data.get('label', sel)
            val = data.get('value')

            # Deduplicate consecutive fills to the same field
            if t == 'fill' and steps and steps[-1]['action'] == 'fill' and steps[-1]['target'] == sel:
                steps[-1]['value'] = val
                return

            name = {
                'click':    f"Click: {lbl}",
                'fill':     f"Fill {lbl}: {val}",
                'navigate': f"Navigate to {lbl}",
            }.get(t, f"{t}: {lbl}")

            steps.append({'name': name, 'action': t, 'target': sel, 'value': val, 'expected_result': None})
            print(f"  [{len(steps):2}] {name}")

        await context.expose_binding("__recordAction", on_action)

        # Auto-inject recorder into every page (fires before page scripts)
        await context.add_init_script(script=_RECORDER_JS)

        # Record navigation events as steps
        def on_navigated(frame):
            if frame.page != page:
                return
            url = frame.url
            if url and url != prev_url[0] and not url.startswith('about:') and not url.startswith('data:'):
                steps.append({
                    'name': f"Navigate to {_url_label(url)}",
                    'action': 'navigate',
                    'target': url,
                    'value': None,
                    'expected_result': 'Page loaded'
                })
                prev_url[0] = url
                print(f"  [{len(steps):2}] Navigate to {url}")

        page = await context.new_page()
        page.on("framenavigated", lambda f: on_navigated(f))

        await page.goto(start_url)
        prev_url[0] = start_url

        print("""
  Browser is open. Perform your scenario:
    1. Log in with orcanos.tech credentials
    2. Navigate to the screens you want to test
    3. When done, press ENTER here to save the scenario.
""")

        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, input, "  >> Press ENTER when done recording: ")

        await browser.close()

    # Save
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)
    filepath = out / f"{scenario_name}.json"

    scenario = {
        "name": scenario_name,
        "base_url": start_url,
        "user": "orcanos.tech",
        "created_at": datetime.utcnow().isoformat(),
        "steps": steps
    }
    filepath.write_text(json.dumps(scenario, indent=2))

    print(f"\n  Saved: {filepath}")
    print(f"  Steps recorded: {len(steps)}\n")
    for i, s in enumerate(steps, 1):
        val = f" = {s['value']}" if s.get('value') else ""
        print(f"  {i:2}. [{s['action']:8}] {s['name']}{val}")

    return str(filepath)


def _url_label(url: str) -> str:
    try:
        from urllib.parse import urlparse
        parts = [p for p in urlparse(url).path.rstrip('/').split('/') if p]
        return parts[-1] if parts else url
    except Exception:
        return url[:60]


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/record_scenario.py <scenario_name> [start_url]")
        print('Example: python scripts/record_scenario.py "login_flow" "https://app.orcanos.com/orcanos/web/"')
        sys.exit(1)

    scenario_name = sys.argv[1]
    start_url = sys.argv[2] if len(sys.argv) > 2 else "https://app.orcanos.com/orcanos/web/"
    output_dir = Path(__file__).parent.parent / "backend" / "scenarios"

    print(f"""
╔══════════════════════════════════════════════════════════╗
║        ORCANOS SCENARIO RECORDER                         ║
╚══════════════════════════════════════════════════════════╝
  Scenario : {scenario_name}
  Start URL: {start_url}
  Saved to : {output_dir}/{scenario_name}.json

  Passwords are auto-replaced with {{{{PASSWORD}}}}
  Email/user fields are auto-replaced with {{{{USER}}}}
""")

    asyncio.run(_record(scenario_name, start_url, str(output_dir)))


if __name__ == "__main__":
    main()
