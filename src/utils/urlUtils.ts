export function validateURL(url: string): string | null {
  try {
    const parsedURL = new URL(url);
    if (parsedURL.protocol !== "https:") {
      return "Only HTTPS URLs are accepted for security reasons";
    }
    return null;
  } catch (err) {
    return "Please enter a valid URL";
  }
}
