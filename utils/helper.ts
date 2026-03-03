export const generateFileName = (originalName?: string): string => {
  if (originalName) {
    // Extract extension from original name
    const ext = originalName.split('.').pop() || 'jpg';
    // Clean the original name (remove path, keep only filename without extension)
    const baseName = originalName.split('/').pop()?.split('.')[0] || 'image';
    // Generate new name with timestamp and random suffix
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `${baseName}_${timestamp}_${randomSuffix}.${ext}`;
  }
  // Generate completely new name
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `scan_${timestamp}_${randomSuffix}.jpg`;
};

export const generateLastName = (): string => {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `User${timestamp.toString().slice(-6)}${randomSuffix}`;
};
