import { Fragment } from "react";

/** Admin text with line breaks: each "\n" becomes <br>, as in the original design. */
export function Multiline({ text }: { text: string }) {
  return text.split("\n").map((line, index) => (
    <Fragment key={index}>
      {index > 0 && <br />}
      {line}
    </Fragment>
  ));
}
