import { Window } from './Window';

interface AboutWindowProps {
  onClose: () => void;
  id: string;
}

export function AboutWindow({ onClose, id }: AboutWindowProps) {
  return (
    <Window
      id={id}
      title="About This Computer"
      onClose={onClose}
      initialSize={{ width: 400, height: 250 }}
      initialPosition={{ x: 100, y: 50 }}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="text-center">
          <div className="text-2xl mb-2">🖥️</div>
          <h2 className="font-chicago text-sm mb-4">Macintosh System 7</h2>
        </div>
        
        <div className="w-full border-t border-b border-black py-4 space-y-2">
          <div className="font-chicago text-xs">
            <span className="inline-block w-32">Total Memory:</span>
            <span>8,192K</span>
          </div>
          <div className="font-chicago text-xs">
            <span className="inline-block w-32">System Software:</span>
            <span>2,048K</span>
          </div>
          <div className="font-chicago text-xs">
            <span className="inline-block w-32">Available Memory:</span>
            <span>6,144K</span>
          </div>
          <div className="font-chicago text-xs">
            <span className="inline-block w-32">Largest Unused Block:</span>
            <span>6,144K</span>
          </div>
        </div>

        <div className="text-center font-chicago text-[10px] text-gray-600">
          System Software 7.0.1
          <br />
          © Apple Computer, Inc. 1983-1991
        </div>
      </div>
    </Window>
  );
} 