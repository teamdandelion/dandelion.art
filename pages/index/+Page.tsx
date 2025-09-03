export default function Page() {
  return (
    <>
      <h1 className={"font-bold text-3xl pb-4"}>dandelion.art</h1>
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:w-1/2">
          <p>
            I'm Dandelion Mané. Welcome to my personal site! I'm a software
            engineer, a generative artist, a social dancer, and a spiritually
            curious human.
          </p>
          <p className="mt-4">
            This page is under construction, and I'm still deciding exactly how
            and what I'd like to share. For now, please enjoy this image from
            QQL, a generative art project that I co-created with Tyler Hobbs in
            2022.
          </p>
        </div>
        <div className="w-full md:w-1/2">
          <img
            src="/art/qql-276.png"
            alt="QQL #276"
            className="w-full h-auto rounded-lg shadow-lg"
            loading="eager"
            fetchPriority="high"
          />
          <p className="text-sm text-center mt-2 text-base-content/70">
            <a
              href="https://qql.art/token/0x0b62e5caff1b4f9605e78c3ca8016c0a4b4e23cbdc7209719f18ffff141120ce"
              className="link link-primary"
            >
              QQL #276
            </a>
            , by Tyler Hobbs and Dandelion Mané (2022)
          </p>
        </div>
      </div>
    </>
  );
}
