import { ChevronDown, Globe, Menu, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b bg-background w-full mx-auto">
      <div className="container flex gap-4 h-16 items-center mx-auto w-full max-w-5xl justify-between px-8">
        
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Image src="/logo.svg" alt="Logo" width={150} height={32} />
          </Link>
          
          <nav className="hidden md:flex gap-10 items-center">
            <ul className="flex items-center gap-6">
              <li className="flex items-center">
                <a href="#" className="flex items-center gap-1 text-sm font-medium">
                  Нүүр
                </a>
              </li>
              <li>
                <a href="#" className="text-sm font-medium flex items-center gap-1">
                  Ажлын байр <ChevronDown size={16} />
                </a>
              </li>
              <li className="flex items-center">
                <a href="#" className="flex items-center gap-1 text-sm font-medium">
                  Аутсорсинг <ChevronDown size={16} />
                </a>
              </li>
              <li className="flex items-center">
                <a href="#" className="flex items-center gap-1 text-sm font-medium">
                  Ламбда гэж юу вэ? <ChevronDown size={16} />
                </a>
              </li>
            </ul>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 rounded-full border px-2 py-1">
            <Globe size={16} />
            <span className="text-sm font-medium">EN</span>
          </div>
          
          <button className="rounded-full bg-muted p-2">
            <User size={20} />
          </button>
          
          <button className="md:hidden">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
} 