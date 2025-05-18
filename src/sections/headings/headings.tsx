import { Heading } from "./types";
import { getHeadings } from "./getHeadings";

export function Headings() {
  const headings = getHeadings();

  return (
    <ul>
      {headings.map((heading, index) => (
        <li
          variant="heading"
          key={index}
          style={{ marginLeft: `${(heading.level - 1) * 8}px` }}
        >
          <span>{`<${heading.tag}>`}</span> {heading.text}
        </li>
      ))}
    </ul>
  );
}
