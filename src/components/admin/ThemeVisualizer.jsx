// src/components/admin/ThemeVisualizer.jsx
import React from "react";
import { Card, CardContent, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button"; // We still use this for the danger button

// Helper function create the style object (unchanged)
const getThemeStyle = (themeData) => {
  if (!themeData) return {};
  return {
    "--color-primary": themeData.primary || "#3b82f6",
    "--color-primary-light": themeData.primaryLight || "#60a5fa",
    "--color-primary-dark": themeData.primaryDark || "#2563eb",
    "--color-secondary": themeData.secondary || "#ec4899",
    "--color-secondary-dark": themeData.secondaryDark || "#be185d",
    "--color-accent-blue": themeData.accentBlue || "#0ea5e9",
    "--color-accent-green": themeData.accentGreen || "#22c55e",
    "--color-accent-black": themeData.accentBlack || "#18181b",
    "--color-text-on-primary": themeData.textOnPrimary || "#ffffff",
  };
};

export function ThemeVisualizer({ themeData }) {
  const themeStyle = getThemeStyle(themeData);

  const previewButtonStyle = `
    w-full px-6 py-3 
    font-display font-bold text-lg 
    rounded-lg shadow-md 
    transition-all duration-fast 
    text-center
  `;

  return (
    <Card className="w-full">
      <CardContent>
        <CardTitle className="mb-4">Live Theme Preview</CardTitle>
        
        {/* Apply the theme to this wrapper div */}
        <div
          style={themeStyle}
          className="p-6 rounded-lg bg-neutral-900 border-2 border-neutral-700"
        >
          <div className="space-y-4">
            <h3 className="font-display text-2xl font-bold text-primary border-b-4 border-primary-dark pb-2">
              This is a Primary Header
            </h3>
            <p className="text-primary-light">
              This is Primary Light text.
            </p>
            <p className="text-neutral-300">
              This is standard body text. It will look great with your new
              theme. The colors below are also live.
            </p>
            
            {/* --- THIS IS THE FIX --- */}
            <div 
              className={previewButtonStyle}
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-text-on-primary)'
              }}
            >
              Primary Button
            </div>
            {/* --- END FIX --- */}

            <div className="grid grid-cols-2 gap-4">
              <Button variant="danger">Danger Button</Button>
              <div className="w-full px-6 py-3 font-display font-bold text-lg rounded-lg shadow-md text-white bg-secondary-dark text-center">
                Secondary Dark
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-accent-black">
              <p className="text-accent-green font-bold">Correct Answer</p>
              <div className="h-4 w-1/3 rounded bg-accent-green"></div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-accent-black">
              <p className="text-accent-blue font-bold">Accent Blue</p>
              <div className="h-4 w-1/J-full rounded bg-accent-blue"></div>
            </div>

          </div>
        </div>
      </CardContent>
    </Card>
  );
}