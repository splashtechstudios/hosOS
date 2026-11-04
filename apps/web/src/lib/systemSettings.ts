'use client';

export const SETTINGS_STORAGE_KEY_BLOCKS = 'hosos_enable_blocks';

/**
 * Returns whether Room Blocks / Wings organization is enabled.
 * Default is FALSE (pure room numbers e.g. "Room 1", "Room 2", etc.).
 */
export function getEnableBlocksSetting(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const val = localStorage.getItem(SETTINGS_STORAGE_KEY_BLOCKS);
    return val === 'true';
  } catch {
    return false;
  }
}

/**
 * Updates the Enable Blocks setting and broadcasts an event to all components.
 */
export function setEnableBlocksSetting(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY_BLOCKS, enabled ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('hosos_settings_updated', { detail: { enableBlocks: enabled } }));
  } catch (err) {
    console.error('Failed to save enableBlocks setting:', err);
  }
}

/**
 * Helper to strip any Block or Wing prefixes from a room name string.
 * e.g. "Block A1 Room 1" -> "Room 1", "Wing A Room 2" -> "Room 2".
 */
export function cleanRoomNumberString(raw: string): string {
  if (!raw) return '';
  return raw.replace(/^(?:Block\s+[A-Za-z0-9]+\s+|Wing\s+[A-Za-z0-9]+\s+|Villa\s+Wing\s+)/i, '').trim();
}
