import { Children, type ReactNode } from "react";

export function HomePage({
  artwork,
  children,
}: {
  artwork: ReactNode;
  children: ReactNode;
}) {
  const [heading, ...content] = Children.toArray(children);

  return (
    <>
      <div className="[&>h1]:font-bold [&>h1]:text-3xl [&>h1]:pb-4">
        {heading}
      </div>
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:w-1/2 space-y-4">{content}</div>
        {artwork}
      </div>
    </>
  );
}
