import RemoveBackgroundComponent from "@/components/stability-ai/remove-background";
import StabilityAITestComponent from "@/components/stability-ai/StabilityAITestComponent";
import BackgroundRemovalTester from "./backgroud-removal";

export default function Home() {
  return (
    <div className=" py-5 border-2 container flex justify-center items-center mx-auto flex-col space-y-9 gap-4 align-middle">
      <div className="space-y-20">
        <BackgroundRemovalTester />
        <RemoveBackgroundComponent />
        <StabilityAITestComponent />
      </div>
    </div>
  );
}
