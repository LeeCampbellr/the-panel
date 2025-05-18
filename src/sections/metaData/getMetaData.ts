export function getMetaData(): MetaTag[] {
  const titleTag = document.querySelector("title");
  const metaElements = document.querySelectorAll(
    "head meta[name], head meta[property]"
  );

  const metaData: MetaTag[] = [];

  if (titleTag) {
    metaData.push({
      name: "title",
      content: titleTag.textContent,
    });
  }

  const metaArray = Array.from(metaElements).map((meta) => ({
    name: meta.getAttribute("name") || meta.getAttribute("property"),
    content: meta.getAttribute("content"),
  }));

  const description = metaArray.find((meta) => meta.name === "description");
  if (description) {
    metaData.push(description);
    metaArray.splice(metaArray.indexOf(description), 1);
  }

  metaData.push(...metaArray);

  const canonicalLink = document.querySelector('head link[rel="canonical"]');
  if (canonicalLink) {
    metaData.push({
      name: "canonical",
      content: canonicalLink.getAttribute("href"),
    });
  }

  return metaData;
}
