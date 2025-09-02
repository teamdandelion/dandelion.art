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
            QQL #276, by Tyler Hobbs and Dandelion Mané (2021)
          </p>
          <p className="text-xs text-center mt-0 text-base-content/70 italic">
            Seed discovered by Michael Connery (2023)
          </p>
        </div>
      </div>
    </>
  );
}
