import { Window } from './Window';
import thunderWallpaper from '../assets/wallpaper/thunder_wallpaper.jpg';
import vangokWallpaper from '../assets/wallpaper/vangok_wallpaper.jpg';

interface ControlPanelsWindowProps {
  onClose: () => void;
  id: string;
  onWallpaperChange: (wallpaper: string) => void;
}

const wallpapers = [
  {
    id: 'thunder',
    name: 'Thunder',
    src: thunderWallpaper,
  },
  {
    id: 'vangok',
    name: 'Van Gogh',
    src: vangokWallpaper,
  },
];

export function ControlPanelsWindow({ onClose, id, onWallpaperChange }: ControlPanelsWindowProps) {
  return (
    <Window
      id={id}
      title="Control Panels"
      onClose={onClose}
      initialPosition={{ x: 120, y: 60 }}
      initialSize={{ width: 400, height: 300 }}
    >
      <div className="h-full flex flex-col bg-white p-4">
        <h2 className="font-chicago text-sm mb-4">Desktop Background</h2>
        <div className="grid grid-cols-2 gap-4">
          {wallpapers.map((wallpaper) => (
            <div
              key={wallpaper.id}
              className="cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => onWallpaperChange(wallpaper.src)}
            >
              <img
                src={wallpaper.src}
                alt={wallpaper.name}
                className="w-full h-32 object-cover border border-black"
              />
              <p className="font-chicago text-xs mt-1 text-center">{wallpaper.name}</p>
            </div>
          ))}
        </div>
      </div>
    </Window>
  );
} 