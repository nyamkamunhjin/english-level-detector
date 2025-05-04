import { Chat } from "@/components/chat";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold">English Level Detector</h1>
        <p className="text-muted-foreground">
          Answer a series of questions to determine your English proficiency level
        </p>
      </header>
      
      <main className="w-full max-w-3xl flex-1">
        <Chat />
      </main>
      
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          Assesses English levels from A1 (Beginner) to C2 (Proficient) using adaptive questions
        </p>
        <p className="mt-1">
          Powered by AI - Utilizing advanced language models
        </p>
      </footer>
    </div>
  );
}
