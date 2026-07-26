export enum MessageType {
  Text = 'text',
  Image = 'image',
  File = 'file',
  Voice = 'voice',
  Location = 'location',
  System = 'system',
}

export function parseMessageType(value: string): MessageType {
  switch (value) {
    case 'text': return MessageType.Text;
    case 'image': return MessageType.Image;
    case 'file': return MessageType.File;
    case 'voice': return MessageType.Voice;
    case 'location': return MessageType.Location;
    case 'system': return MessageType.System;
    default: return MessageType.Text;
  }
}
