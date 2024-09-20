import StabilityAISearchReplace from "@/components/stability-ai/SearchAndReplaceComponent";
import StabilityAIInpaint from "@/components/stability-ai/StabilityAIInpaint";

export default function Home() {
  return (
    <div className=" py-5 border-2 container flex justify-center items-center mx-auto flex-col space-y-9 gap-4 align-middle">
      <div className="space-y-20">
        {/* <BackgroundRemovalTester />
        <RemoveBackgroundComponent />
        <StabilityAITestComponent />
        <StableFast3DComponent />
        <SearchAndRecolorComponent /> */}
        <StabilityAISearchReplace />
        <StabilityAIInpaint />
      </div>
    </div>
  );
}
