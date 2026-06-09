#!/usr/bin/env python3
"""
Import accounts from raw data and generate encrypted accounts.json
Usage: python scripts/import_accounts.py
"""

import sys
import os
import json
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.services.encryption import EncryptionService
from dotenv import load_dotenv

load_dotenv()


def extract_account_name(url: str) -> str:
    """
    Extract account name from URL
    https://app.orcanos.com/orcanos/web/ → orcanos
    """
    parts = url.strip('/').split('/')
    for i, part in enumerate(parts):
        if part in ['orcanos', 'us.orcanos.com', 'app.orcanos.com']:
            if i + 1 < len(parts):
                return parts[i + 1]
    return None


def main():
    # Raw account data (URL and password pairs)
    # User will manually add accounts here or from CSV
    raw_accounts = [
        {
            "url": "https://app.orcanos.com/orcanos/web/",
            "password": "OrcSupport_orcanos_3014!"
        }
    ]

    # Encrypt passwords and build accounts.json
    encryption_service = EncryptionService()

    accounts_config = {
        "accounts": [],
        "user": "orcanos.tech",  # Shared user for all accounts
        "thresholds": {
            "warning": 3,
            "critical": 10
        }
    }

    for raw_account in raw_accounts:
        url = raw_account["url"]
        password = raw_account["password"]

        # Extract account name from URL
        account_name = extract_account_name(url)
        if not account_name:
            print(f"Warning: Could not extract account name from {url}, skipping")
            continue

        # Encrypt password
        encrypted_password = encryption_service.encrypt(password)

        account_entry = {
            "name": account_name,
            "url": url,
            "password": encrypted_password,
            "enabled": True
        }

        accounts_config["accounts"].append(account_entry)
        print(f"✓ Added account: {account_name}")

    # Write accounts.json
    accounts_json_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "accounts.json"
    )

    with open(accounts_json_path, 'w') as f:
        json.dump(accounts_config, f, indent=2)

    print(f"\n✓ Generated {accounts_json_path}")
    print(f"✓ Total accounts: {len(accounts_config['accounts'])}")
    print(f"\nAccounts added:")
    for account in accounts_config["accounts"]:
        print(f"  - {account['name']}: {account['url']}")


if __name__ == "__main__":
    main()
