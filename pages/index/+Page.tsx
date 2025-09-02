import qqlImage from "../../assets/art/qql-276.png";

export default function Page() {
  return (
    <>
      <h1 className={"font-bold text-3xl pb-4"}>dandelion.art</h1>
      <div className="flex gap-8 items-start">
        <div className="w-1/2">
          <p>
            Hi! I'm Dandelion Mané. Welcome to my personal site! I'm a
            spiritually curious human, a software enginer and generative artist,
            a partner dancer, snowboarder, and avid reader. I've made this
            website to share vibes, thoughts, and some art.
          </p>
        </div>
        <div className="w-1/2">
          <img
            src={qqlImage}
            alt="QQL #276"
            className="w-full h-auto rounded-lg shadow-lg"
          />
          <p className="text-sm text-center mt-2 text-base-content/70">
            <a href="https://qql.art/token/0x0b62e5caff1b4f9605e78c3ca8016c0a4b4e23cbdc7209719f18ffff141120ce" className="link link-primary">
              QQL #276
            </a>
            , by <a href="https://www.tylerxhobbs.com" className="link link-primary">Tyler Hobbs</a> and
            Dandelion Mané (2022)
          </p>
          <p className="text-xs text-center mt-0 text-base-content/70 italic">
            Seed discovered by Michael Connery (2023)
          </p>
        </div>
      </div>
    </>
  );
}
