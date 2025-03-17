import { Window } from './Window';
import thunderWallpaper from '../assets/wallpaper/thunder_wallpaper.jpg';
import vangokWallpaper from '../assets/wallpaper/vangok_wallpaper.jpg';
import yellowWallpaper from '../assets/wallpaper/yellow_wallpaper.jpg';
import redWallpaper from '../assets/wallpaper/red_wallpaper.jpg';
import classicWallpaper from '../assets/wallpaper/classic_wallpaper.jpg';
import szaWallpaper from '../assets/wallpaper/sza_wallpaper.jpg';
import treeWallpaper from '../assets/wallpaper/tree_wallpaper.jpg';
import rockWallpaper from '../assets/wallpaper/rock_wallapper.jpg';
import tigerWallpaper from '../assets/wallpaper/tiger_wallpaper.jpg';

interface ControlPanelsWindowProps {
  onClose: () => void;
  id: string;
  onWallpaperChange: (wallpaper: string) => void;
}

const wallpapers = [
  {
    id: 'classic',
    name: 'Classic',
    src: classicWallpaper,
  },
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
  {
    id: 'yellow',
    name: 'Yellow',
    src: yellowWallpaper,
  },
  {
    id: 'red',
    name: 'Red',
    src: redWallpaper,
  },
  {
    id: 'sza',
    name: 'SZA',
    src: szaWallpaper,
  },
  {
    id: 'tree',
    name: 'Tree',
    src: treeWallpaper,
  },
  {
    id: 'rock',
    name: 'Rock',
    src: rockWallpaper,
  },
  {
    id: 'tiger',
    name: 'Tiger',
    src: tigerWallpaper,
  },
];

export function ControlPanelsWindow({ onClose, id, onWallpaperChange }: ControlPanelsWindowProps) {
  return (
    <Window
      id={id}
      title="Control Panels"
      onClose={onClose}
      initialPosition={{ x: 120, y: 60 }}
      initialSize={{ width: 500, height: 600 }}
    >
      <div className="h-full flex flex-col bg-white p-4">
        <h2 className="font-chicago text-sm mb-4">Desktop Background</h2>
        <div className="grid grid-cols-3 gap-4">
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