// frontend/src/components/nav-main.tsx

import Link from 'next/link';
import { type Icon } from '@tabler/icons-react';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { usePath } from '@/hooks/use-path';

function NavMenuItem({
  item,
  index,
}: {
  item: { title: string; url: string; icon?: Icon; active: boolean };
  index: number;
}) {
  // Cycle through 5 custom colors every 3 items
  const colorIndex = Math.floor(index / 3) % 5;

  const linkContent = (
    <>
      {item.icon && <item.icon size={24} />}
      <span className="text-base font-medium">{item.title}</span>
    </>
  );

  // Add margin-top to the first item of each group (except the very first item)
  const isFirstInGroup = index % 3 === 0 && index !== 0;

  return (
    <SidebarMenuItem key={item.title} className={isFirstInGroup ? 'mt-4' : ''}>
      <SidebarMenuButton
        tooltip={item.title}
        asChild
        className="py-6 text-white"
        style={{
          backgroundColor: `var(--color-${colorIndex + 1})`,
        }}
      >
        {item.active ? (
          <Link href={item.url}>{linkContent}</Link>
        ) : (
          <div aria-disabled="true" className="cursor-not-allowed opacity-50">
            {linkContent}
          </div>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
    active: boolean;
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item, index) => (
            <NavMenuItem key={item.title} item={item} index={index} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
