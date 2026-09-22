'use client';

import React from 'react';

interface TouchControlsProps {
  onButtonDown?: (code: string) => void;
  onButtonUp?: (code: string) => void;
}

export function TouchControls({ onButtonDown, onButtonUp }: TouchControlsProps) {
  const triggerKey = (code: string, isDown: boolean) => {
    if (isDown) {
      if (onButtonDown) onButtonDown(code);
      window.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true }));
    } else {
      if (onButtonUp) onButtonUp(code);
      window.dispatchEvent(new KeyboardEvent('keyup', { code, bubbles: true }));
    }
  };

  const makeTouchHandler = (code: string) => ({
    onTouchStart: (e: React.TouchEvent) => {
      e.preventDefault();
      triggerKey(code, true);
    },
    onTouchEnd: (e: React.TouchEvent) => {
      e.preventDefault();
      triggerKey(code, false);
    },
    onMouseDown: (e: React.MouseEvent) => {
      e.preventDefault();
      triggerKey(code, true);
    },
    onMouseUp: (e: React.MouseEvent) => {
      e.preventDefault();
      triggerKey(code, false);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      triggerKey(code, false);
    },
  });

  return (
    <div className="w-full max-w-2xl mx-auto mt-4 select-none touch-none pb-4">
      {/* Shoulder L & R Buttons */}
      <div className="flex items-center justify-between px-6 mb-3">
        <button
          {...makeTouchHandler('KeyA')}
          className="px-6 py-2 rounded-t-lg bg-[#18212e] border-t-2 border-x-2 border-[#38475c] active:bg-[#5c67f2] active:text-white text-xs font-mono font-bold text-slate-300 shadow-md"
        >
          [ L ]
        </button>
        <button
          {...makeTouchHandler('KeyS')}
          className="px-6 py-2 rounded-t-lg bg-[#18212e] border-t-2 border-x-2 border-[#38475c] active:bg-[#5c67f2] active:text-white text-xs font-mono font-bold text-slate-300 shadow-md"
        >
          [ R ]
        </button>
      </div>

      {/* Main Controller Body: D-Pad, Center, Action Buttons */}
      <div className="flex items-center justify-between px-4 sm:px-8">
        {/* D-PAD */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          {/* UP */}
          <button
            {...makeTouchHandler('ArrowUp')}
            className="absolute top-0 w-12 h-12 bg-[#1b2533] border border-[#32435a] rounded-t-md active:bg-[#5c67f2] flex items-center justify-center font-bold text-slate-200 text-sm shadow-md"
          >
            ▲
          </button>
          {/* DOWN */}
          <button
            {...makeTouchHandler('ArrowDown')}
            className="absolute bottom-0 w-12 h-12 bg-[#1b2533] border border-[#32435a] rounded-b-md active:bg-[#5c67f2] flex items-center justify-center font-bold text-slate-200 text-sm shadow-md"
          >
            ▼
          </button>
          {/* LEFT */}
          <button
            {...makeTouchHandler('ArrowLeft')}
            className="absolute left-0 w-12 h-12 bg-[#1b2533] border border-[#32435a] rounded-l-md active:bg-[#5c67f2] flex items-center justify-center font-bold text-slate-200 text-sm shadow-md"
          >
            ◀
          </button>
          {/* RIGHT */}
          <button
            {...makeTouchHandler('ArrowRight')}
            className="absolute right-0 w-12 h-12 bg-[#1b2533] border border-[#32435a] rounded-r-md active:bg-[#5c67f2] flex items-center justify-center font-bold text-slate-200 text-sm shadow-md"
          >
            ▶
          </button>
          {/* Center axis plate */}
          <div className="w-12 h-12 bg-[#161f2b] border border-[#232f3f]" />
        </div>

        {/* Center: Select & Start */}
        <div className="flex flex-col gap-3 items-center self-end mb-2">
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <button
                {...makeTouchHandler('Space')}
                className="w-12 h-4 bg-[#1b2533] border border-[#32435a] rounded-full active:bg-[#5c67f2] -rotate-25 shadow-sm"
              />
              <span className="text-[10px] font-mono text-[#64748b] mt-1 uppercase">Select</span>
            </div>
            <div className="flex flex-col items-center">
              <button
                {...makeTouchHandler('Enter')}
                className="w-12 h-4 bg-[#1b2533] border border-[#32435a] rounded-full active:bg-[#5c67f2] -rotate-25 shadow-sm"
              />
              <span className="text-[10px] font-mono text-[#64748b] mt-1 uppercase">Start</span>
            </div>
          </div>
        </div>

        {/* Action Buttons: B and A */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          {/* Button B */}
          <button
            {...makeTouchHandler('KeyZ')}
            className="absolute bottom-2 left-1 w-14 h-14 rounded-full bg-[#1b2533] border-2 border-[#3b4d66] active:bg-[#e63946] active:text-white flex items-center justify-center text-base font-bold text-slate-200 shadow-lg"
          >
            B
          </button>
          {/* Button A */}
          <button
            {...makeTouchHandler('KeyX')}
            className="absolute top-2 right-1 w-14 h-14 rounded-full bg-[#1b2533] border-2 border-[#3b4d66] active:bg-[#e63946] active:text-white flex items-center justify-center text-base font-bold text-slate-200 shadow-lg"
          >
            A
          </button>
        </div>
      </div>
    </div>
  );
}
