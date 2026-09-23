import { AppTheme } from '../types';

/**
 * Utilities for deterministic age calculation and theme-adaptive color styling
 * for the compact Purchase List feature.
 */

export interface PurchaseAgeInfo {
  ageDays: number;
  ageLabel: string;
  badgeLabel: string;
}

/**
 * Calculates calendar day age between item creation date and current date
 */
export function getPurchaseAgeInfo(createdAt: string): PurchaseAgeInfo {
  const now = new Date();
  const created = new Date(createdAt);

  // Normalize to start of calendar day for exact day-difference
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const createdDate = new Date(created.getFullYear(), created.getMonth(), created.getDate()).getTime();

  const diffMs = nowDate - createdDate;
  const ageDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  let ageLabel: string;
  let badgeLabel: string;

  if (ageDays === 0) {
    ageLabel = 'added today';
    badgeLabel = 'today';
  } else if (ageDays === 1) {
    ageLabel = 'added yesterday';
    badgeLabel = '1d';
  } else if (ageDays < 7) {
    ageLabel = 'added ' + ageDays + ' days ago';
    badgeLabel = ageDays + 'd';
  } else if (ageDays < 14) {
    ageLabel = 'added ~1 week ago (' + ageDays + 'd)';
    badgeLabel = '1w';
  } else if (ageDays < 30) {
    const weeks = Math.floor(ageDays / 7);
    ageLabel = 'added ' + weeks + ' weeks ago (' + ageDays + 'd)';
    badgeLabel = weeks + 'w';
  } else {
    const months = Math.floor(ageDays / 30);
    ageLabel = 'added ' + months + ' month' + (months > 1 ? 's' : '') + ' ago (' + ageDays + 'd)';
    badgeLabel = ageDays + 'd';
  }

  return { ageDays, ageLabel, badgeLabel };
}

export interface CompactPurchaseStyles {
  rowClass: string;
  pillClass: string;
  badgeClass: string;
  titleClass: string;
  notesClass: string;
  timeClass: string;
}

/**
 * Deterministic compact color theme styling based on age:
 * - Light Mode: Soft green progression (pale green -> light -> medium -> deeper forest)
 * - Dark Mode: Dark tinted green progression (subtle, readable, deepening with age)
 * - Cotton Candy: Soft pastel progression (#D4EEFF light blue -> periwinkle -> #FFCFE3 cotton pink -> rose -> plum-berry)
 */
export function getCompactPurchaseStyles(ageDays: number, theme: AppTheme = 'night'): CompactPurchaseStyles {
  // COTTON CANDY THEME (Pink -> Lavender -> Sky Blue progression)
  if (theme === 'cotton_candy') {
    if (ageDays === 0) {
      // Day 0: Very soft pink
      return {
        rowClass: 'bg-[#FFF0F6]/95 border-[#FFB6D5] hover:border-[#FF9EC4]',
        pillClass: 'bg-[#FFB6D5]',
        badgeClass: 'bg-[#FFE2EE] text-[#7A1E4D] border border-[#FFB6D5]',
        titleClass: 'text-[#20142B]',
        notesClass: 'text-[#5C2B46]',
        timeClass: 'text-[#8E446B]',
      };
    }
    if (ageDays <= 3) {
      // Day 1-3: Brighter pink
      return {
        rowClass: 'bg-[#FFE8F2] border-[#FF9EC4] hover:border-[#FF70A5]',
        pillClass: 'bg-[#FF85B3]',
        badgeClass: 'bg-[#FFD4E7] text-[#6E1242] border border-[#FF85B3]',
        titleClass: 'text-[#20142B]',
        notesClass: 'text-[#541B3B]',
        timeClass: 'text-[#822E5C]',
      };
    }
    if (ageDays <= 7) {
      // Day 4-7: Deeper pink / lavender transition
      return {
        rowClass: 'bg-[#F6EEFD] border-[#D6A8F9] hover:border-[#BE75F5]',
        pillClass: 'bg-[#C489F5]',
        badgeClass: 'bg-[#ECDBFB] text-[#481A6E] border border-[#C489F5]',
        titleClass: 'text-[#1F112E]',
        notesClass: 'text-[#4D286C]',
        timeClass: 'text-[#74459C]',
      };
    }
    if (ageDays <= 14) {
      // Day 8-14: Soft lavender / sky blue
      return {
        rowClass: 'bg-[#EDF5FE] border-[#A8CEFA] hover:border-[#72A8F5]',
        pillClass: 'bg-[#85B8F7]',
        badgeClass: 'bg-[#DBEAFE] text-[#163B72] border border-[#85B8F7]',
        titleClass: 'text-[#111C2E]',
        notesClass: 'text-[#274676]',
        timeClass: 'text-[#456B9E]',
      };
    }
    // Day 15+: Deeper sky blue
    return {
      rowClass: 'bg-[#E1F2FD] border-[#72BAF2] hover:border-[#3891E0]',
      pillClass: 'bg-[#489FE8]',
      badgeClass: 'bg-[#BAE2FC] text-[#0C355E] border border-[#52A8EC]',
      titleClass: 'text-[#0A1A2B]',
      notesClass: 'text-[#193F67]',
      timeClass: 'text-[#2D5A8C]',
    };
  }

  // DARK MODE (NIGHT)
  if (theme === 'night') {
    if (ageDays === 0) {
      return {
        rowClass: 'bg-[#121E15]/90 border-[#1E3A24] hover:border-[#2D5A37]',
        pillClass: 'bg-[#3E7D4E]',
        badgeClass: 'bg-[#1E3A24]/80 text-[#B8E2C1] border border-[#2E5937]',
        titleClass: 'text-[#F2FAF4]',
        notesClass: 'text-[#A8C8AF]',
        timeClass: 'text-[#7CA884]',
      };
    }
    if (ageDays <= 3) {
      return {
        rowClass: 'bg-[#15271A] border-[#264D2E] hover:border-[#376E44]',
        pillClass: 'bg-[#4B985F]',
        badgeClass: 'bg-[#254A2E] text-[#C2E8CA] border border-[#386D45]',
        titleClass: 'text-[#F4FCF6]',
        notesClass: 'text-[#B0D4B7]',
        timeClass: 'text-[#84B88E]',
      };
    }
    if (ageDays <= 7) {
      return {
        rowClass: 'bg-[#1A3321] border-[#305F3B] hover:border-[#438352]',
        pillClass: 'bg-[#5CB575]',
        badgeClass: 'bg-[#305F3B] text-[#CEF2D6] border border-[#488D58]',
        titleClass: 'text-[#FFFFFF]',
        notesClass: 'text-[#BCE0C3]',
        timeClass: 'text-[#90C89A]',
      };
    }
    if (ageDays <= 14) {
      return {
        rowClass: 'bg-[#203E28] border-[#3B7347] hover:border-[#4F9960]',
        pillClass: 'bg-[#6FD48C]',
        badgeClass: 'bg-[#3B7347] text-[#DCF8E3] border border-[#52A163]',
        titleClass: 'text-[#FFFFFF]',
        notesClass: 'text-[#C8E9CF]',
        timeClass: 'text-[#A0DAB0]',
      };
    }
    // 15+ days
    return {
      rowClass: 'bg-[#264D31] border-[#478B55] hover:border-[#5CB06F]',
      pillClass: 'bg-[#86F0A5]',
      badgeClass: 'bg-[#478B55] text-[#E8FCEE] border border-[#63BE78]',
      titleClass: 'text-[#FFFFFF]',
      notesClass: 'text-[#D6F3DD]',
      timeClass: 'text-[#B2ECC0]',
    };
  }

  // LIGHT MODE (WARM CREAM)
  if (ageDays === 0) {
    return {
      rowClass: 'bg-[#F2FAF4] border-[#D1ECD7] hover:border-[#B2DEC0]',
      pillClass: 'bg-[#70B880]',
      badgeClass: 'bg-[#E0F4E6] text-[#245431] border border-[#C2E9CC]',
      titleClass: 'text-[#193B22]',
      notesClass: 'text-[#3B6645]',
      timeClass: 'text-[#507F5A]',
    };
  }
  if (ageDays <= 3) {
    return {
      rowClass: 'bg-[#E5F5E9] border-[#BFDFCA] hover:border-[#9FD0AD]',
      pillClass: 'bg-[#50A564]',
      badgeClass: 'bg-[#D2EED8] text-[#1E4D29] border border-[#AEE2B9]',
      titleClass: 'text-[#163B1F]',
      notesClass: 'text-[#35613F]',
      timeClass: 'text-[#4A7954]',
    };
  }
  if (ageDays <= 7) {
    return {
      rowClass: 'bg-[#D3EED8] border-[#A8D4B1] hover:border-[#86C292]',
      pillClass: 'bg-[#388F4E]',
      badgeClass: 'bg-[#BFE2C8] text-[#164420] border border-[#96D1A3]',
      titleClass: 'text-[#103317]',
      notesClass: 'text-[#2B5433]',
      timeClass: 'text-[#406E48]',
    };
  }
  if (ageDays <= 14) {
    return {
      rowClass: 'bg-[#BFE5C6] border-[#91C89B] hover:border-[#6FB37B]',
      pillClass: 'bg-[#25793B]',
      badgeClass: 'bg-[#A8D9B1] text-[#0F3818] border border-[#7DBF8B]',
      titleClass: 'text-[#0B2A12]',
      notesClass: 'text-[#224A28]',
      timeClass: 'text-[#35613B]',
    };
  }
  // 15+ days
  return {
    rowClass: 'bg-[#A8DCB1] border-[#79BA86] hover:border-[#5AA367]',
    pillClass: 'bg-[#156029]',
    badgeClass: 'bg-[#8ECB9C] text-[#092B11] border border-[#64AB73]',
    titleClass: 'text-[#07200D]',
    notesClass: 'text-[#183E1E]',
    timeClass: 'text-[#28522E]',
  };
}

/**
 * Purchased items styling: compact, clean, muted, and de-emphasized
 */
export function getPurchasedCompactStyles(theme: AppTheme = 'night'): CompactPurchaseStyles {
  if (theme === 'cotton_candy') {
    return {
      rowClass: 'bg-white/70 border-[#E8D3E4]/70 opacity-75 hover:opacity-100',
      pillClass: 'bg-[#D8B4E2]',
      badgeClass: 'bg-[#F5EBF7] text-[#6B5872] border border-[#E8D3E4]',
      titleClass: 'text-[#6B5872] line-through',
      notesClass: 'text-[#6B5872]/80',
      timeClass: 'text-[#8E7896]',
    };
  }

  if (theme === 'night') {
    return {
      rowClass: 'bg-night-surface/60 border-night-border/60 opacity-70 hover:opacity-100',
      pillClass: 'bg-night-border',
      badgeClass: 'bg-night-elevated text-night-muted border border-night-border',
      titleClass: 'text-night-muted line-through',
      notesClass: 'text-night-muted/80',
      timeClass: 'text-night-muted/60',
    };
  }

  return {
    rowClass: 'bg-light-surface/70 border-light-border/70 opacity-75 hover:opacity-100',
    pillClass: 'bg-light-border',
    badgeClass: 'bg-light-bg text-light-muted border border-light-border',
    titleClass: 'text-light-muted line-through',
    notesClass: 'text-light-muted/80',
    timeClass: 'text-light-muted/70',
  };
}

/**
 * Discarded items styling: subtle, de-emphasized, distinguishing from purchased items
 */
export function getDiscardedCompactStyles(theme: AppTheme = 'night'): CompactPurchaseStyles {
  if (theme === 'cotton_candy') {
    return {
      rowClass: 'bg-white/50 border-[#E8D3E4]/50 opacity-70 hover:opacity-95',
      pillClass: 'bg-[#C5B4D6]',
      badgeClass: 'bg-[#F2E8FA] text-[#7A6388] border border-[#DDCDE8]',
      titleClass: 'text-[#7A6388] line-through opacity-85',
      notesClass: 'text-[#7A6388]/80',
      timeClass: 'text-[#9682A3]',
    };
  }

  if (theme === 'night') {
    return {
      rowClass: 'bg-[#18151A]/60 border-[#2D2430] opacity-65 hover:opacity-95',
      pillClass: 'bg-[#4A3B52]',
      badgeClass: 'bg-[#251E2B] text-[#A697B0] border border-[#3E3245]',
      titleClass: 'text-[#9B8C9E] line-through opacity-85',
      notesClass: 'text-[#9B8C9E]/75',
      timeClass: 'text-[#7E7082]',
    };
  }

  return {
    rowClass: 'bg-light-bg/60 border-light-border/50 opacity-70 hover:opacity-95',
    pillClass: 'bg-light-border/80',
    badgeClass: 'bg-light-surface/80 text-light-muted border border-light-border/70',
    titleClass: 'text-light-muted line-through opacity-85',
    notesClass: 'text-light-muted/75',
    timeClass: 'text-light-muted/65',
  };
}
