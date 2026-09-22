import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Gamepad2, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto my-16">
      <div className="p-4 rounded-2xl bg-[#18212e] border border-[#263548] text-[#5c67f2] mb-5 shadow-2xl">
        <Gamepad2 className="w-10 h-10" />
      </div>
      <span className="font-mono text-xs tracking-widest text-[#818cf8] uppercase mb-1">
        ERROR 404 • PANTALLA NO ENCONTRADA
      </span>
      <h1 className="text-3xl font-extrabold text-white mb-2">
        Cartucho no insertado
      </h1>
      <p className="text-sm text-[#94a3b8] mb-8 leading-relaxed">
        La ruta a la que intentas acceder no existe en la memoria del sistema o el juego ha sido reubicado.
      </p>

      <Link href="/">
        <Button variant="gba" icon={<ArrowLeft className="w-4 h-4" />}>
          Volver al Inicio
        </Button>
      </Link>
    </div>
  );
}
