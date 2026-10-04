import React from 'react';
import { Callout, type CalloutType } from '@roboforge/ui';
import { InteractiveCircuitChallenge } from '../circuit/InteractiveCircuitChallenge';

interface Block {
  type: 'h2' | 'h3' | 'callout' | 'ul' | 'ol' | 'math' | 'p';
  text?: string;
  items?: string[];
  formula?: string;
  calloutType?: string;
  title?: string;
  content?: string;
}

export function parseMarkdownBlocks(md: string): Block[] {
  const blocks: Block[] = [];
  const lines = md.split('\n');
  let i = 0;

  while (i < lines.length) {
    const currentLine = lines[i];
    if (currentLine === undefined) {
      i++;
      continue;
    }

    // Skip empty lines
    if (!currentLine.trim()) {
      i++;
      continue;
    }

    // Callout tags: <Callout type="..." title="...">...</Callout>
    if (currentLine.trim().startsWith('<Callout')) {
      const typeMatch = currentLine.match(/type=["']([^"']+)["']/);
      const titleMatch = currentLine.match(/title=["']([^"']+)["']/);
      const type = typeMatch ? typeMatch[1] : 'info';
      const title = titleMatch ? titleMatch[1] : '';

      let content = '';
      if (currentLine.includes('</Callout>')) {
        content = currentLine.replace(/<Callout[^>]*>/, '').replace('</Callout>', '').trim();
        i++;
      } else {
        i++;
        const contentLines: string[] = [];
        while (i < lines.length) {
          const l = lines[i];
          if (l === undefined || l.includes('</Callout>')) break;
          contentLines.push(l);
          i++;
        }
        if (i < lines.length) {
          const closingLine = lines[i];
          if (closingLine !== undefined && closingLine.includes('</Callout>')) {
            contentLines.push(closingLine.replace('</Callout>', ''));
            i++;
          }
        }
        content = contentLines.join('\n').trim();
      }
      blocks.push({ type: 'callout', calloutType: type, title, content });
      continue;
    }

    // Headings
    if (currentLine.startsWith('### ')) {
      blocks.push({ type: 'h3', text: currentLine.replace('### ', '').trim() });
      i++;
      continue;
    }
    if (currentLine.startsWith('## ')) {
      blocks.push({ type: 'h2', text: currentLine.replace('## ', '').trim() });
      i++;
      continue;
    }

    // Math block: $$...$$
    if (currentLine.trim().startsWith('$$')) {
      let math = currentLine.trim().slice(2);
      if (math.endsWith('$$') && math.length > 2) {
        math = math.slice(0, -2);
        blocks.push({ type: 'math', formula: math });
        i++;
        continue;
      }
      i++;
      const mathLines: string[] = [math];
      while (i < lines.length) {
        const ml = lines[i];
        if (ml === undefined || ml.includes('$$')) break;
        mathLines.push(ml);
        i++;
      }
      if (i < lines.length) {
        const closingMath = lines[i];
        if (closingMath !== undefined && closingMath.includes('$$')) {
          mathLines.push(closingMath.replace('$$', ''));
          i++;
        }
      }
      blocks.push({ type: 'math', formula: mathLines.join('\n').trim() });
      continue;
    }

    // Unordered lists (- or *)
    if (currentLine.trim().startsWith('- ') || currentLine.trim().startsWith('* ')) {
      const items: string[] = [];
      while (i < lines.length) {
        const ulLine = lines[i];
        if (
          ulLine !== undefined &&
          (ulLine.trim().startsWith('- ') || ulLine.trim().startsWith('* '))
        ) {
          items.push(ulLine.trim().replace(/^[-*]\s+/, ''));
          i++;
        } else {
          break;
        }
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    // Ordered lists (1. 2. etc)
    if (/^\d+\.\s+/.test(currentLine.trim())) {
      const items: string[] = [];
      while (i < lines.length) {
        const olLine = lines[i];
        if (olLine !== undefined && /^\d+\.\s+/.test(olLine.trim())) {
          items.push(olLine.trim().replace(/^\d+\.\s+/, ''));
          i++;
        } else {
          break;
        }
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    // Paragraph
    const paraLines: string[] = [currentLine];
    i++;
    while (i < lines.length) {
      const pLine = lines[i];
      if (
        pLine !== undefined &&
        pLine.trim() &&
        !pLine.startsWith('#') &&
        !pLine.startsWith('<Callout') &&
        !pLine.startsWith('$$') &&
        !pLine.trim().startsWith('- ') &&
        !pLine.trim().startsWith('* ') &&
        !/^\d+\.\s+/.test(pLine.trim())
      ) {
        paraLines.push(pLine);
        i++;
      } else {
        break;
      }
    }
    blocks.push({ type: 'p', text: paraLines.join(' ').trim() });
  }

  return blocks;
}

export function renderFormattedText(text: string): React.ReactNode[] {
  // Regex to match **bold**, `code`, $math$
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\$[^$]+\$)/g;
  const parts = text.split(regex);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-surface-subtle text-amber-300 font-mono text-xs border border-border-subtle"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('$') && part.endsWith('$')) {
      return (
        <span key={idx} className="font-mono text-sky-300 bg-sky-950/40 px-1 rounded text-sm">
          {part.slice(1, -1)}
        </span>
      );
    }
    return part;
  });
}

interface LessonMarkdownRendererProps {
  lessonId: string;
  rawMarkdown: string;
}

export const LessonMarkdownRenderer: React.FC<LessonMarkdownRendererProps> = ({
  lessonId,
  rawMarkdown,
}) => {
  const blocks = React.useMemo(() => parseMarkdownBlocks(rawMarkdown), [rawMarkdown]);

  return (
    <div className="space-y-6 text-base leading-relaxed">
      {blocks.map((block, idx) => {
        if (block.type === 'h2') {
          const isChallengeAnchor =
            (lessonId === 'm01-l01-what-is-electricity' && block.text?.includes('3. See It')) ||
            (lessonId === 'm01-l06-switches-and-buttons' && block.text?.includes('3. Switch State')) ||
            (lessonId === 'm02-l07-diodes-and-leds' && block.text?.includes('3. The Need'));

          return (
            <React.Fragment key={idx}>
              <h2 className="text-2xl font-bold text-white pt-4">{block.text}</h2>
              {isChallengeAnchor && lessonId === 'm01-l01-what-is-electricity' && (
                <InteractiveCircuitChallenge
                  title="Hands-On Challenge: Complete the Circuit Loop"
                  instructions="Flip the switch on the breadboard to close the circuit loop. Verify that electric current flows through the resistor and safely illuminates the LED without exceeding safe current limits."
                  initialPreset="led_safe"
                  assertion={{
                    target: 'component_status',
                    id: 'LED1',
                    expectedValue: 'ok',
                    explanation: 'The LED is conducting safe current through the completed loop.',
                  }}
                />
              )}
              {isChallengeAnchor && lessonId === 'm01-l06-switches-and-buttons' && (
                <InteractiveCircuitChallenge
                  title="Hands-On Challenge: Test the Mechanical Switch"
                  instructions="Toggle the breadboard switch to observe circuit interruption. Verify that when the switch is open, current ceases immediately."
                  initialPreset="led_safe"
                  assertion={{
                    target: 'switch_state',
                    id: 'SW1',
                    expectedValue: 'closed',
                    explanation: 'The switch is closed and conducting power.',
                  }}
                />
              )}
              {isChallengeAnchor && lessonId === 'm02-l07-diodes-and-leds' && (
                <InteractiveCircuitChallenge
                  title="Hands-On Challenge: Forward-Biased LED with Series Resistor"
                  instructions="Observe how the 350-Ohm current-limiting resistor absorbs excess voltage to protect the sensitive LED diode from destruction."
                  initialPreset="led_safe"
                  assertion={{
                    target: 'component_status',
                    id: 'LED1',
                    expectedValue: 'ok',
                    explanation: 'The LED is operating safely within its maximum current rating.',
                  }}
                />
              )}
            </React.Fragment>
          );
        }

        if (block.type === 'h3') {
          return (
            <h3 key={idx} className="text-lg font-bold text-sky-300 pt-2">
              {block.text}
            </h3>
          );
        }

        if (block.type === 'callout') {
          return (
            <Callout
              key={idx}
              type={(block.calloutType as CalloutType) || 'info'}
              title={block.title}
            >
              {renderFormattedText(block.content || '')}
            </Callout>
          );
        }

        if (block.type === 'math') {
          return (
            <div
              key={idx}
              className="my-4 p-4 rounded-xl bg-slate-900/80 border border-sky-500/30 text-center font-mono text-lg text-sky-300 shadow-inner"
            >
              {block.formula}
            </div>
          );
        }

        if (block.type === 'ul' && block.items) {
          return (
            <ul key={idx} className="list-disc list-inside space-y-2 ml-4">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx}>{renderFormattedText(item)}</li>
              ))}
            </ul>
          );
        }

        if (block.type === 'ol' && block.items) {
          return (
            <ol
              key={idx}
              className="list-decimal list-inside space-y-2 ml-4 bg-slate-900/50 p-4 rounded-xl border border-border-subtle"
            >
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx}>{renderFormattedText(item)}</li>
              ))}
            </ol>
          );
        }

        if (block.type === 'p' && block.text) {
          return <p key={idx}>{renderFormattedText(block.text)}</p>;
        }

        return null;
      })}
    </div>
  );
};
