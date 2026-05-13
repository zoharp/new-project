#!/usr/bin/env python3
"""
Utility script to encrypt passwords for accounts.json
Usage: python scripts/encrypt_password.py "your-password-here"
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.services.encryption import EncryptionService
from dotenv import load_dotenv

load_dotenv()

def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/encrypt_password.py <password>")
        print("\nExample:")
        print('  python scripts/encrypt_password.py "MyPassword123!"')
        sys.exit(1)

    password = sys.argv[1]

    try:
        service = EncryptionService()
        encrypted = service.encrypt(password)
        print(f"\nOriginal password: {password}")
        print(f"Encrypted password: {encrypted}")
        print("\nCopy the encrypted password into accounts.json")
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
