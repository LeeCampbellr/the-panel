export function getHeadings(): Heading[] {
  const headingsElements = document.querySelectorAll("h1, h2, h3, h4, h5, h6");

  const headingData = Array.from(headingsElements)
    .filter((heading) => !heading.closest("[data-the-panel]"))
    .map((heading) => ({
      text: heading.textContent,
      level: parseInt(heading.tagName.charAt(1)),
      tag: heading.tagName.toLowerCase(),
    }));

  return headingData;
}
