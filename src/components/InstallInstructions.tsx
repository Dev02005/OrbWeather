import { Share, SquarePlus, EllipsisVertical } from 'lucide-react';
import { isIOS } from '../utils/platform';
import './InstallInstructions.css';

/**
 * How to add OrbWeather to the Home Screen. iOS has no install prompt a page can
 * trigger, so its steps point at Safari's own Share sheet instead.
 */
export function InstallInstructions() {
  if (isIOS()) {
    return (
      <ol className="install-steps">
        <li>
          Tap the <strong>Share</strong> button
          <Share size={16} className="install-step-icon" aria-hidden="true" />
          in Safari’s toolbar.
        </li>
        <li>
          Scroll down and tap <strong>Add to Home Screen</strong>
          <SquarePlus size={16} className="install-step-icon" aria-hidden="true" />
        </li>
        <li>
          Tap <strong>Add</strong>, then open OrbWeather <strong>from its new icon</strong>, not from Safari.
        </li>
      </ol>
    );
  }

  return (
    <ol className="install-steps">
      <li>
        Open your browser’s menu
        <EllipsisVertical size={16} className="install-step-icon" aria-hidden="true" />
      </li>
      <li>
        Choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.
      </li>
      <li>Open OrbWeather from its new icon.</li>
    </ol>
  );
}
