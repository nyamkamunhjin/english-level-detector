import { Chat } from "@/components/chat";
import { Header } from "@/components/header";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="mx-auto max-w-3xl">
          <Chat />
        </div>
      </main>
      
      <footer className="py-6 border-t bg-white">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>
            Assesses English levels from A1 (Beginner) to C2 (Proficient) using adaptive questions
          </p>
          <p className="mt-1">
            Powered by AI - Utilizing advanced language models
          </p>
        </div>
      </footer>
    </div>
  );
}
