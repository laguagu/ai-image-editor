import StabilityAISearchReplace from "@/components/stability-ai/SearchAndReplaceComponent";
import StabilityAIInpaint from "@/components/stability-ai/StabilityAIInpaint";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        AI Image Editor
      </h1>
      <Tabs defaultValue="search-replace" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search-replace">Search and Replace</TabsTrigger>
          <TabsTrigger value="inpaint">Background Modification</TabsTrigger>
        </TabsList>
        <TabsContent value="search-replace">
          <Card>
            <CardHeader>
              <CardTitle>Search and Replace Elements</CardTitle>
              <CardDescription>
                Replace specific elements in your image using AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StabilityAISearchReplace />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="inpaint">
          <Card>
            <CardHeader>
              <CardTitle>Background Modification</CardTitle>
              <CardDescription>
                Replace or modify backgrounds in your images using AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StabilityAIInpaint />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
