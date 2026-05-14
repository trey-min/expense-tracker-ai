"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, List, CloudUpload } from "lucide-react";

interface Props {
  onExport: () => void;
}

export default function Navbar({ onExport }: Props) {
  const path = usePathname();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/expenses", label: "Expenses", icon: List },
  ];

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-lg font-bold text-indigo-600 mr-4">ExpenseAI</span>
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ${
                path === href
                  ? "bg-indigo-50 text-indigo-700 font-medium"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm shadow-indigo-200"
        >
          <CloudUpload size={15} />
          Export Hub
        </button>
      </div>
    </header>
  );
}
