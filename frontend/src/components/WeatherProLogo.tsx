import React from 'react'; 
import { Cloud } from 'lucide-react';

export const WeatherProLogo: React.FC = () => { 
  return ( 
  <div className="flex items-center gap-3 justify-center"> 
  <div className="relative"> {/* Nuage principal */} 
    <Cloud className="w-10 h-10 text-emerald-500 drop-shadow-sm" /> 
    {/* Petites gouttes d'eau animées */} 
    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full opacity-70 animate-bounce"
     style={{ animationDelay: '0.5s', animationDuration: '2s' }}>
    </div>
        <div className="absolute top-1 -right-2 w-2 h-2 bg-blue-300 rounded-full opacity-50 animate-bounce"
         style={{ animationDelay: '1s', animationDuration: '2.5s' }}>  
        </div> 
        <div className="absolute -top-2 right-1 w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-60 animate-bounce" 
        style={{ animationDelay: '1.5s', animationDuration: '3s' }}>
       </div>
        </div>
         <div className="text-left"> 
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent"> WeatherPro </h1> 
        <p className="text-sm text-gray-500 font-medium tracking-wide"> OCP × EMSI Innovation </p>
         </div>
          </div> 
          );
         }