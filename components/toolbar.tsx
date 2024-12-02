import { forwardRef } from 'react';
import Image from 'next/image';

export default forwardRef<HTMLDivElement>(function Toolbar({}, ref) {
  return (
    <div ref={ref} id="toolbar-container" className="fixed bottom-2 w-full hidden justify-center m-2">
      <div id="toolbar">
        <InventoryBlock blockType="pickaxe" id="toolbar-0" selected />
        <InventoryBlock blockType="grass" id="toolbar-1" />
        <InventoryBlock blockType="dirt" id="toolbar-2" />
        <InventoryBlock blockType="stone" id="toolbar-3" />
        <InventoryBlock blockType="coal_ore" id="toolbar-4" />
        <InventoryBlock blockType="iron_ore" id="toolbar-5" />
        <InventoryBlock blockType="tree_top" id="toolbar-6" />
        <InventoryBlock blockType="leaves" id="toolbar-7" />
        <InventoryBlock blockType="sand" id="toolbar-8" />
      </div>
    </div>
  );
});

function InventoryBlock({ blockType, id, selected }: { blockType: string; id: string; selected?: boolean }) {
  return (
    <div className={`toolbar-icon ${selected && 'selected'}`} id={id}>
      <Image src={`/textures/${blockType}.png`} alt={blockType} width={64} height={64} />
    </div>
  );
}
