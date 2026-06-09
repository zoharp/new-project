"""
Encryption service for storing sensitive account passwords
Uses AES-256 symmetric encryption
"""

from cryptography.fernet import Fernet
import os
import base64
import hashlib


class EncryptionService:
    """Service for encrypting/decrypting sensitive data"""

    def __init__(self):
        """Initialize with encryption key from environment"""
        encryption_key_hex = os.getenv("ENCRYPTION_KEY")
        if not encryption_key_hex:
            raise ValueError("ENCRYPTION_KEY environment variable not set")

        # Convert hex key to 32-byte key for Fernet
        encryption_key = bytes.fromhex(encryption_key_hex)
        # Encode to base64 (Fernet requirement)
        self.cipher_key = base64.urlsafe_b64encode(encryption_key)
        self.cipher = Fernet(self.cipher_key)

    def encrypt(self, plaintext: str) -> str:
        """
        Encrypt a string
        Args:
            plaintext: The string to encrypt
        Returns:
            The encrypted string (base64 encoded)
        """
        encrypted = self.cipher.encrypt(plaintext.encode())
        return base64.b64encode(encrypted).decode()

    def decrypt(self, ciphertext: str) -> str:
        """
        Decrypt a string
        Args:
            ciphertext: The encrypted string (base64 encoded)
        Returns:
            The decrypted string
        """
        encrypted = base64.b64decode(ciphertext)
        decrypted = self.cipher.decrypt(encrypted)
        return decrypted.decode()

    @staticmethod
    def generate_key() -> str:
        """
        Generate a new encryption key (32-char hex string)
        Use this to create a new ENCRYPTION_KEY
        Returns:
            A 32-character hex string suitable for ENCRYPTION_KEY
        """
        return Fernet.generate_key().hex()[:32]


# Singleton instance
_encryption_service = None


def get_encryption_service() -> EncryptionService:
    """Get or create the encryption service singleton"""
    global _encryption_service
    if _encryption_service is None:
        _encryption_service = EncryptionService()
    return _encryption_service
