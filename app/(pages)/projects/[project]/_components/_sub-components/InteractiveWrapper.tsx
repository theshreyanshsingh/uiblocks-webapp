'use client';

import { handleAskAI, handleGenerateVariants } from '@/app/_services/projects';
import type React from 'react';
import { useState, useRef, useEffect, type ReactNode, createContext, useContext, useCallback } from 'react';
import { createPortal } from 'react-dom';

// Unique ID generator
const generateId = () => `element-${Math.random().toString(36).substr(2, 9)}`;

// Element types for different control options
type ElementType = 'button' | 'input' | 'toggle' | 'select' | 'text' | 'generic';

// Interface for element data
interface ElementData {
  id: string;
  type: ElementType;
  position: { x: number; y: number };
  size: { width: number | string; height: number | string };
  content?: string;
  isOn?: boolean;
  label?: string;
}

// Context to provide control box customization options
interface InteractiveContextType {
  registerInteractiveElement: (element: HTMLElement, type?: ElementType) => void;
  unregisterInteractiveElement: (element: HTMLElement) => void;
  getElementData: (id: string) => ElementData | undefined;
  updateElementData: (id: string, data: Partial<ElementData>) => void;
  duplicateElement: (id: string) => void;
  deleteElement: (id: string) => void;
}

const InteractiveContext = createContext<InteractiveContextType | null>(null);

interface ControlBoxProps {
  position: { x: number; y: number };
  element: HTMLElement;
  elementType: ElementType;
  elementId: string;
  onClose: () => void;
  onApplyChanges: () => void;
}

const ControlBox: React.FC<ControlBoxProps> = ({
  position,
  element,
  elementType,
  elementId,
  onClose,
  onApplyChanges,
}) => {
  const [controlPosition, setControlPosition] = useState(position);
  const controlRef = useRef<HTMLDivElement>(null);
  const context = useContext(InteractiveContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editLabel, setEditLabel] = useState('');

  const [input, setInput] = useState('');

  const elementData = context?.getElementData(elementId);
  console.log(onClose);
  // Initialize edit content when element is selected
  useEffect(() => {
    if (elementType === 'text' && element) {
      setEditContent(element.textContent || '');
    }

    if (elementData?.label) {
      setEditLabel(elementData.label);
    }
  }, [element, elementType, elementData]);

  // Adjust position if control box would go off-screen
  useEffect(() => {
    if (controlRef.current) {
      const rect = controlRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newX = position.x;
      let newY = position.y;

      // Adjust horizontal position if needed
      if (newX + rect.width > viewportWidth - 20) {
        newX = Math.max(20, viewportWidth - rect.width - 20);
      }

      // Adjust vertical position if needed
      if (newY + rect.height > viewportHeight - 20) {
        newY = Math.max(20, viewportHeight - rect.height - 20);
      }

      if (newX !== position.x || newY !== position.y) {
        setControlPosition({ x: newX, y: newY });
      }
    }
  }, [position]);

  // For mobile devices, position at the bottom of the screen
  const boxStyle = {
    position: 'absolute',
    top: `${controlPosition.y}px`,
    left: `${controlPosition.x}px`,
    minWidth: '250px',
    maxWidth: '300px',
  } as React.CSSProperties;

  // const handleDuplicate = () => {
  //   if (context) {
  //     context.duplicateElement(elementId);
  //     onClose();
  //   }
  // };

  // const handleDelete = () => {
  //   if (context) {
  //     context.deleteElement(elementId);
  //     onClose();
  //   }
  // };

  const handleSaveEdit = () => {
    if (context && elementType === 'text') {
      if (element) {
        element.textContent = editContent;
      }
      context.updateElementData(elementId, { content: editContent });
    }

    if (context && elementData?.label !== undefined) {
      context.updateElementData(elementId, { label: editLabel });
    }

    setIsEditing(false);
    onApplyChanges();
  };

  // Toggle-specific controls
  const renderToggleControls = () => {
    if (elementType !== 'toggle') return null;

    return (
      <div className="mt-3 pt-2 border-t ">
        <div className="text-sm font-medium mb-2">Toggle Settings</div>
        <div className="space-y-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Label</label>
            <input
              type="text"
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              className="w-full px-2 py-1 text-sm border rounded"
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Current State:</span>
            <span className={`font-medium ${elementData?.isOn ? 'text-green-500' : 'text-gray-500'}`}>
              {elementData?.isOn ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Text editing controls
  const renderTextControls = () => {
    if (elementType !== 'text' || !isEditing) return null;

    return (
      <div className="mt-3 pt-2 border-t">
        <div className="text-sm font-medium mb-2">Edit Text</div>
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full px-2 py-1 text-sm border rounded min-h-[80px]"
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleSaveEdit}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center"
          >
            Save Text
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={controlRef}
      className="bg-[#0F0F0F] border border-[#141415] rounded-lg shadow-lg p-3 z-50 control-box"
      style={boxStyle}
    >
      <div className="space-y-3">
        <textarea
          id="quick-changes"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
          }}
          cols={5}
          maxLength={500}
          required
          className="text-xs resize-none font-sans outline-none min-h-[60px] max-h-[150px] font-medium mt-1 block w-full rounded-md border-white/10 bg-white/5 p-2  text-white placeholder-white/40 shadow-sm focus:border-none focus:outline-none"
          placeholder="What would you like to do?"
        />
      </div>

      {renderToggleControls()}
      {renderTextControls()}

      <div className="mt-3 pt-2 flex justify-between items-center">
        <button
          onClick={() => {
            handleGenerateVariants({ input: input });
          }}
          className=" hover:bg-[#141415] text-xs font-sans font-medium text-white px-2 p-1 rounded-md transition-colors"
        >
          Generate Variants
        </button>
        <span className="text-gray-700">|</span>
        <button
          onClick={() => {
            handleAskAI({ input: input });
          }}
          className=" hover:bg-[#141415] text-xs font-sans font-medium text-white px-2 p-1 rounded-md transition-colors"
        >
          Ask AI
        </button>
      </div>
    </div>
  );
};

interface InteractiveWrapperProps {
  children: ReactNode;
}

export default function InteractiveWrapper({ children }: InteractiveWrapperProps) {
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [selectedElementType, setSelectedElementType] = useState<ElementType>('generic');
  const [selectedElementId, setSelectedElementId] = useState<string>('');
  const [controlBoxPosition, setControlBoxPosition] = useState({ x: 0, y: 0 });
  const [interactiveElements, setInteractiveElements] = useState<Set<HTMLElement>>(new Set());
  const [elementsData, setElementsData] = useState<Record<string, ElementData>>({});
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  // Create portal container for the control box
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const container = document.createElement('div');
      container.id = 'interactive-wrapper-portal';
      document.body.appendChild(container);
      setPortalContainer(container);

      return () => {
        document.body.removeChild(container);
      };
    }
  }, []);

  // Register and unregister interactive elements
  const registerInteractiveElement = useCallback((element: HTMLElement, type: ElementType = 'generic') => {
    setInteractiveElements((prev) => {
      const newSet = new Set(prev);
      newSet.add(element);
      return newSet;
    });

    // Get or create element ID
    let elementId = element.dataset.elementId;
    if (!elementId) {
      elementId = generateId();
      element.dataset.elementId = elementId;
    }

    // Get or create element type
    let elementType = element.dataset.elementType as ElementType;
    if (!elementType) {
      elementType = type;
      element.dataset.elementType = elementType;
    }

    // Initialize element data if not exists
    setElementsData((prev) => {
      if (!prev[elementId]) {
        return {
          ...prev,
          [elementId]: {
            id: elementId,
            type: elementType,
            position: { x: 0, y: 0 },
            size: { width: 'auto', height: 'auto' },
            content: element.textContent || undefined,
            isOn:
              element.tagName === 'INPUT' && (element as HTMLInputElement).type === 'checkbox'
                ? (element as HTMLInputElement).checked
                : undefined,
            label: element.previousElementSibling?.textContent || undefined,
          },
        };
      }
      return prev;
    });
  }, []);

  const unregisterInteractiveElement = useCallback((element: HTMLElement) => {
    setInteractiveElements((prev) => {
      const newSet = new Set(prev);
      newSet.delete(element);
      return newSet;
    });

    // Remove element data
    const elementId = element.dataset.elementId;
    if (elementId) {
      setElementsData((prev) => {
        const newData = { ...prev };
        delete newData[elementId];
        return newData;
      });
    }
  }, []);

  // Get element data
  const getElementData = useCallback(
    (id: string) => {
      return elementsData[id];
    },
    [elementsData],
  );

  // Update element data
  const updateElementData = useCallback((id: string, data: Partial<ElementData>) => {
    setElementsData((prev) => {
      if (!prev[id]) return prev;

      return {
        ...prev,
        [id]: {
          ...prev[id],
          ...data,
        },
      };
    });
  }, []);

  // Duplicate element
  const duplicateElement = useCallback(
    (id: string) => {
      const originalData = elementsData[id];
      if (!originalData) return;

      const newId = generateId();
      const newData: ElementData = {
        ...originalData,
        id: newId,
        position: {
          x: originalData.position.x + 20,
          y: originalData.position.y + 20,
        },
      };

      setElementsData((prev) => ({
        ...prev,
        [newId]: newData,
      }));

      // Clone the element in the DOM
      const originalElement = document.querySelector(`[data-element-id="${id}"]`);
      if (originalElement && originalElement.parentElement) {
        const clonedElement = originalElement.cloneNode(true) as HTMLElement;
        clonedElement.dataset.elementId = newId;

        // Insert after the original element's wrapper
        const originalWrapper = originalElement.closest('.interactive-element-wrapper');
        if (originalWrapper && originalWrapper.parentElement) {
          const newWrapper = document.createElement('div');
          newWrapper.className = 'duplicated-element-placeholder';
          newWrapper.dataset.duplicatedId = newId;
          originalWrapper.parentElement.insertBefore(newWrapper, originalWrapper.nextSibling);
        }
      }
    },
    [elementsData],
  );

  // Delete element
  const deleteElement = useCallback((id: string) => {
    // Remove element data
    setElementsData((prev) => {
      const newData = { ...prev };
      delete newData[id];
      return newData;
    });

    // Remove element from DOM
    const element = document.querySelector(`[data-element-id="${id}"]`);
    if (element) {
      const wrapper = element.closest('.interactive-element-wrapper');
      if (wrapper && wrapper.parentElement) {
        wrapper.parentElement.removeChild(wrapper);
      }
    }
  }, []);

  // Find all interactive elements within the Demo component using a more comprehensive approach
  useEffect(() => {
    if (!wrapperRef.current) return;

    const findInteractiveElements = (root: HTMLElement) => {
      // Common interactive elements
      const selectors = [
        'button',
        'a',
        'input',
        'select',
        'textarea',
        '[role="button"]',
        '[role="link"]',
        '[role="checkbox"]',
        '[role="radio"]',
        '[role="switch"]',
        '[role="slider"]',
        '[role="menuitem"]',
        '[role="tab"]',
        '[tabindex]:not([tabindex="-1"])',
        '.interactive-element',
        'p',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'span',
        'div:not(.interactive-wrapper):not(.interactive-element-wrapper):not(.control-box)',
      ];

      const elements = Array.from(root.querySelectorAll<HTMLElement>(selectors.join(',')));

      // Add elements to the set
      elements.forEach((element) => {
        // Skip elements inside the control box or wrapper controls
        if (element.closest('.control-box') || element.closest('.drag-handle') || element.closest('.resize-handle'))
          return;

        // Determine element type
        let type: ElementType = 'generic';

        if (element.tagName === 'BUTTON' || element.getAttribute('role') === 'button') {
          type = 'button';
        } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
          type = 'input';
        } else if (element.tagName === 'SELECT') {
          type = 'select';
        } else if (
          (element.tagName === 'INPUT' && (element as HTMLInputElement).type === 'checkbox') ||
          element.getAttribute('role') === 'switch'
        ) {
          type = 'toggle';
        } else if (
          element.tagName === 'P' ||
          element.tagName === 'H1' ||
          element.tagName === 'H2' ||
          element.tagName === 'H3' ||
          element.tagName === 'H4' ||
          element.tagName === 'H5' ||
          element.tagName === 'H6' ||
          element.tagName === 'SPAN'
        ) {
          type = 'text';
        }

        registerInteractiveElement(element, type);
      });
    };

    // Initial scan
    findInteractiveElements(wrapperRef.current);

    // Set up a mutation observer to detect new interactive elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              findInteractiveElements(node as HTMLElement);
            }
          });
        }
      });
    });

    observer.observe(wrapperRef.current, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [registerInteractiveElement]);

  // Handle element interaction (click and touch)
  useEffect(() => {
    const handleElementInteraction = (e: Event) => {
      const target = e.target as HTMLElement;
      const interactiveElement = findClosestInteractiveElement(target);

      if (!interactiveElement) return;

      // Don't select elements within the control box or wrapper controls
      if (
        interactiveElement.closest('.control-box') ||
        interactiveElement.closest('.drag-handle') ||
        interactiveElement.closest('.resize-handle')
      )
        return;

      // Prevent default only for touch events to avoid navigation
      if (e.type === 'touchstart') {
        e.preventDefault();
      }

      // Get element ID and type
      const elementId = interactiveElement.dataset.elementId || '';
      const elementType = (interactiveElement.dataset.elementType as ElementType) || 'generic';

      setSelectedElement(interactiveElement);
      setSelectedElementType(elementType);
      setSelectedElementId(elementId);

      // Make text elements editable
      if (elementType === 'text') {
        interactiveElement.contentEditable = 'true';
      }

      // Position the control box near the selected element
      const rect = interactiveElement.getBoundingClientRect();
      const scrollX = window.scrollX || document.documentElement.scrollLeft;
      const scrollY = window.scrollY || document.documentElement.scrollTop;

      setControlBoxPosition({
        x: rect.right + scrollX + 10,
        y: rect.top + scrollY,
      });
    };

    // Helper function to find the closest interactive element
    const findClosestInteractiveElement = (element: HTMLElement): HTMLElement | null => {
      let current: HTMLElement | null = element;

      while (current && current !== wrapperRef.current) {
        if (interactiveElements.has(current)) {
          return current;
        }
        current = current.parentElement;
      }

      return null;
    };

    // Use event delegation for better performance
    const handleWrapperInteraction = (e: Event) => {
      handleElementInteraction(e);
    };

    const wrapperElement = wrapperRef.current;
    if (wrapperElement) {
      wrapperElement.addEventListener('click', handleWrapperInteraction);
      wrapperElement.addEventListener('touchstart', handleWrapperInteraction, { passive: false });
    }

    return () => {
      if (wrapperElement) {
        wrapperElement.removeEventListener('click', handleWrapperInteraction);
        wrapperElement.removeEventListener('touchstart', handleWrapperInteraction);
      }
    };
  }, [interactiveElements]);

  // Handle clicking outside to close the control box
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (!selectedElement) return;

      const target = e.target as Node;

      // Check if the click is outside both the selected element and the control box
      const isOutsideSelectedElement = !selectedElement.contains(target);
      const isOutsideControlBox = !document.querySelector('.control-box')?.contains(target);

      if (isOutsideSelectedElement && isOutsideControlBox) {
        // Save content for text elements
        if (selectedElementType === 'text' && selectedElement.contentEditable === 'true') {
          selectedElement.contentEditable = 'false';

          // Update element data with new content
          if (selectedElementId) {
            updateElementData(selectedElementId, { content: selectedElement.textContent || '' });
          }
        }

        setSelectedElement(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [selectedElement, selectedElementType, selectedElementId, updateElementData]);

  const handleApplyChanges = () => {
    // Simulate applying changes to the application state
    console.log('Applying changes to selected element:', selectedElement);

    // Show a visual confirmation
    if (selectedElement) {
      // Add a temporary class for animation
      selectedElement.classList.add('interactive-element-updated');

      // Remove the class after animation completes
      setTimeout(() => {
        selectedElement.classList.remove('interactive-element-updated');
      }, 1000);

      // For text elements, disable contentEditable
      if (selectedElementType === 'text') {
        selectedElement.contentEditable = 'false';
      }
    }

    // Close the control box
    setSelectedElement(null);
  };

  // Context value
  const contextValue: InteractiveContextType = {
    registerInteractiveElement,
    unregisterInteractiveElement,
    getElementData,
    updateElementData,
    duplicateElement,
    deleteElement,
  };

  return (
    <InteractiveContext.Provider value={contextValue}>
      <div ref={wrapperRef} className="interactive-wrapper relative">
        {/* Add custom styles for interactive elements */}
        <style jsx global>{`
          /* Base styles for all interactive elements */
          .interactive-wrapper button,
          .interactive-wrapper a,
          .interactive-wrapper input,
          .interactive-wrapper select,
          .interactive-wrapper textarea,
          .interactive-wrapper [role='button'],
          .interactive-wrapper [role='link'],
          .interactive-wrapper [role='checkbox'],
          .interactive-wrapper [role='radio'],
          .interactive-wrapper [role='switch'],
          .interactive-wrapper [role='slider'],
          .interactive-wrapper [role='menuitem'],
          .interactive-wrapper [role='tab'],
          .interactive-wrapper [tabindex]:not([tabindex='-1']),
          .interactive-wrapper p,
          .interactive-wrapper h1,
          .interactive-wrapper h2,
          .interactive-wrapper h3,
          .interactive-wrapper h4,
          .interactive-wrapper h5,
          .interactive-wrapper h6,
          .interactive-wrapper span,
          .interactive-wrapper div:not(.interactive-wrapper):not(.interactive-element-wrapper):not(.control-box),
          .interactive-wrapper .interactive-element {
            position: relative;
            transition: all 0.2s ease;
          }

          /* Hover effect - blue outline */
          .interactive-wrapper button:hover,
          .interactive-wrapper a:hover,
          .interactive-wrapper input:hover,
          .interactive-wrapper select:hover,
          .interactive-wrapper textarea:hover,
          .interactive-wrapper [role='button']:hover,
          .interactive-wrapper [role='link']:hover,
          .interactive-wrapper [role='checkbox']:hover,
          .interactive-wrapper [role='radio']:hover,
          .interactive-wrapper [role='switch']:hover,
          .interactive-wrapper [role='slider']:hover,
          .interactive-wrapper [role='menuitem']:hover,
          .interactive-wrapper [role='tab']:hover,
          .interactive-wrapper [tabindex]:not([tabindex='-1']):hover,
          .interactive-wrapper p:hover,
          .interactive-wrapper h1:hover,
          .interactive-wrapper h2:hover,
          .interactive-wrapper h3:hover,
          .interactive-wrapper h4:hover,
          .interactive-wrapper h5:hover,
          .interactive-wrapper h6:hover,
          .interactive-wrapper span:hover,
          .interactive-wrapper div:not(.interactive-wrapper):not(.interactive-element-wrapper):not(.control-box):hover,
          .interactive-wrapper .interactive-element:hover {
            outline: 2px solid #3b82f6;
            outline-offset: 2px;
            z-index: 1;
          }

          /* Selected element - thicker blue outline with pulse animation */
          .interactive-element-selected {
            outline: 3px solid #2563eb !important;
            outline-offset: 3px !important;
            z-index: 2 !important;
            box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.3);
          }

          /* Update animation */
          @keyframes pulse-success {
            0% {
              box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7);
            }
            70% {
              box-shadow: 0 0 0 10px rgba(74, 222, 128, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(74, 222, 128, 0);
            }
          }

          .interactive-element-updated {
            animation: pulse-success 1s ease-out;
            outline: 3px solid #4ade80 !important;
            outline-offset: 3px !important;
          }

          /* Drag and resize handles */
          .drag-handle {
            transition: opacity 0.2s ease;
          }

          .resize-handle {
            position: absolute;
            width: 8px;
            height: 8px;
            background-color: #3b82f6;
            border-radius: 50%;
            z-index: 10;
            opacity: 0;
            transition: opacity 0.2s ease;
          }

          .interactive-element-wrapper:hover .resize-handle {
            opacity: 1;
          }

          .resize-handle-top {
            top: -4px;
            left: 50%;
            transform: translateX(-50%);
            cursor: ns-resize;
          }

          .resize-handle-right {
            top: 50%;
            right: -4px;
            transform: translateY(-50%);
            cursor: ew-resize;
          }

          .resize-handle-bottom {
            bottom: -4px;
            left: 50%;
            transform: translateX(-50%);
            cursor: ns-resize;
          }

          .resize-handle-left {
            top: 50%;
            left: -4px;
            transform: translateY(-50%);
            cursor: ew-resize;
          }

          .resize-handle-top-right {
            top: -4px;
            right: -4px;
            cursor: nesw-resize;
          }

          .resize-handle-bottom-right {
            bottom: -4px;
            right: -4px;
            cursor: nwse-resize;
          }

          .resize-handle-bottom-left {
            bottom: -4px;
            left: -4px;
            cursor: nesw-resize;
          }

          .resize-handle-top-left {
            top: -4px;
            left: -4px;
            cursor: nwse-resize;
          }

          /* Editable text elements */
          [contenteditable='true'] {
            border: 1px dashed #3b82f6;
            padding: 2px;
            min-height: 1em;
          }
        `}</style>

        {/* Render the Demo component */}
        {children}

        {/* Render the control box in a portal if an element is selected */}

        {selectedElement &&
          portalContainer &&
          createPortal(
            <ControlBox
              position={controlBoxPosition}
              element={selectedElement}
              elementType={selectedElementType}
              elementId={selectedElementId}
              onClose={() => setSelectedElement(null)}
              onApplyChanges={handleApplyChanges}
            />,
            portalContainer,
          )}
      </div>
    </InteractiveContext.Provider>
  );
}

// Add a useInteractive hook for custom components to register themselves
export function useInteractive() {
  const context = useContext(InteractiveContext);
  if (!context) {
    throw new Error('useInteractive must be used within an InteractiveWrapper');
  }
  return context;
}
