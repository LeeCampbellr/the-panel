import { MetaTag } from "./types";
import { getMetaData } from "./getMetaData";

export function MetaData() {
  const metaData = getMetaData();

  return (
    <ul>
      {metaData.map((meta) => (
        <li key={meta.name}>
          {meta.name} : {meta.content}
        </li>
      ))}
    </ul>
  );
}
