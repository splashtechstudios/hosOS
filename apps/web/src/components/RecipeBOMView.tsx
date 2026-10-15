'use client';

import React, { useState } from 'react';
import { StaffUser } from '@hosos/types';
import { useFeedback } from '@/context/FeedbackContext';
import {
  Layers,
  UtensilsCrossed,
  Plus,
  Search,
  DollarSign,
  Package,
  TrendingUp,
  Percent,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

interface RecipeBOMViewProps {
  activeStaff: StaffUser;
}

export default function RecipeBOMView({ activeStaff }: RecipeBOMViewProps) {
  const { showConfirm, showSuccess } = useFeedback();
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'MAINS' | 'GRILLS' | 'APPETIZERS' | 'BAR'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const recipes = [
    {
      id: 'BOM-01',
      name: 'Oseika Seafood Okro with Semo/Eba',
      category: 'MAINS',
      sellingPrice: 28000,
      cogsCost: 8900,
      marginPercent: 68.2,
      prepTime: '25 mins',
      chefSignOff: 'Chef Donald Umeh',
      ingredients: [
        { name: 'Fresh Jumbo Prawns (3 pcs)', quantity: '180g', unitCost: 3500 },
        { name: 'Fresh White Crab (1 pc)', quantity: '1 pc', unitCost: 2000 },
        { name: 'Fresh Fish Fillet (Croaker)', quantity: '150g', unitCost: 1800 },
        { name: 'Diced Okro & Uziza leaves', quantity: '200g', unitCost: 600 },
        { name: 'Palm Oil & Seasoning Stock', quantity: '50ml', unitCost: 1000 },
      ],
      autoDeductOnPOS: true,
      stockStatus: 'OPTIMAL',
    },
    {
      id: 'BOM-02',
      name: 'Charcoal Grilled Whole Croaker & Jollof Rice',
      category: 'GRILLS',
      sellingPrice: 22000,
      cogsCost: 6400,
      marginPercent: 70.9,
      prepTime: '30 mins',
      chefSignOff: 'Chef Donald Umeh',
      ingredients: [
        { name: 'Whole Croaker Fish (Grade A)', quantity: '1 whole (800g)', unitCost: 4000 },
        { name: 'Parboiled Long Grain Rice', quantity: '250g', unitCost: 650 },
        { name: 'Tomato/Pepper Paste Blend', quantity: '120g', unitCost: 750 },
        { name: 'Spices, Thyme, Curry & Stock', quantity: '40g', unitCost: 500 },
        { name: 'Vegetable Oil', quantity: '60ml', unitCost: 500 },
      ],
      autoDeductOnPOS: true,
      stockStatus: 'OPTIMAL',
    },
    {
      id: 'BOM-03',
      name: 'Peppered Goat Meat Asun (Platter)',
      category: 'APPETIZERS',
      sellingPrice: 16000,
      cogsCost: 4800,
      marginPercent: 70.0,
      prepTime: '15 mins',
      chefSignOff: 'Chef Donald Umeh',
      ingredients: [
        { name: 'Boneless Smoked Goat Meat', quantity: '400g', unitCost: 3600 },
        { name: 'Habanero Peppers & Red Onion', quantity: '100g', unitCost: 500 },
        { name: 'Vegetable Oil & Seasoning', quantity: '30ml', unitCost: 700 },
      ],
      autoDeductOnPOS: true,
      stockStatus: 'LOW_STOCK',
    },
    {
      id: 'BOM-04',
      name: 'Oseika Signature Smoked Old Fashioned',
      category: 'BAR',
      sellingPrice: 14000,
      cogsCost: 3200,
      marginPercent: 77.1,
      prepTime: '5 mins',
      chefSignOff: 'Emeka Nwosu',
      ingredients: [
        { name: 'Woodford Reserve Bourbon', quantity: '60ml (2 tots)', unitCost: 2600 },
        { name: 'Angostura Aromatic Bitters', quantity: '3 dashes (5ml)', unitCost: 300 },
        { name: 'Cane Sugar Demerara Syrup', quantity: '10ml', unitCost: 150 },
        { name: 'Orange Zest & Applewood Smoke', quantity: '1 garnish', unitCost: 150 },
      ],
      autoDeductOnPOS: true,
      stockStatus: 'OPTIMAL',
    },
  ];

  const filteredRecipes = recipes.filter(r => {
    if (selectedCategory !== 'ALL' && r.category !== selectedCategory) return false;
    if (searchQuery && !r.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px 0' }}>
      
      {/* Header Toolbar */}
      <div className="ent-card" style={{ padding: '18px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={22} color="var(--brand-primary)" />
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Recipe Bill of Materials (BOM) & Menu Engineering
              </h2>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Standardized portion costing, ingredient deduction triggers upon POS order fire, and gross profit margin controls.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                showSuccess(
                  'Recipe Matrix Exported Successfully',
                  'Standardized menu formulations and Bill of Materials exported (.xlsx) for F&B procurement.',
                  `Author: ${activeStaff.name} • 48 Menu Items Active`
                );
              }}
              className="btn-secondary"
            >
              <FileSpreadsheet size={15} color="var(--emerald-primary)" />
              <span>Export Recipe Matrix</span>
            </button>
            <button
              onClick={() => {
                showSuccess(
                  'BOM Formulation Builder Ready',
                  'Select dish category and add components from Central Stores to construct new recipe.',
                  'All portions will automatically link to POS kitchen fire.'
                );
              }}
              className="btn-primary"
            >
              <Plus size={15} />
              <span>+ Add Recipe BOM</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px',
      }}>
        <div className="ent-kpi-card" style={{ borderLeft: '3px solid var(--emerald-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Average F&B Gross Margin
            </span>
            <span className="badge badge-clean">Target: &gt;65%</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--emerald-primary)', fontFamily: 'var(--font-mono)' }}>
            71.5%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Food Cost: 28.5% across active menu items
          </div>
        </div>

        <div className="ent-kpi-card" style={{ borderLeft: '3px solid var(--brand-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Active Standardized BOMs
            </span>
            <span className="badge badge-brand">POS Linked</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            48 Dishes & Drinks
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Direct inventory auto-depletion enabled
          </div>
        </div>

        <div className="ent-kpi-card" style={{ borderLeft: '3px solid var(--amber-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Ingredient Depletion Alerts
            </span>
            <span className="badge badge-warning">2 Raw Items</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--amber-primary)', fontFamily: 'var(--font-mono)' }}>
            Goat Meat & Uziza
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Below 3-day minimum cold store buffer
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="ent-card" style={{ padding: '14px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['ALL', 'MAINS', 'GRILLS', 'APPETIZERS', 'BAR'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: selectedCategory === cat ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                  color: selectedCategory === cat ? '#FFFFFF' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 10px',
            border: '1px solid var(--border-color)',
          }}>
            <Search size={14} color="var(--text-muted)" />
            <input
              placeholder="Search recipe BOM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', padding: 0, fontSize: '0.75rem' }}
            />
          </div>
        </div>
      </div>

      {/* Recipe Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
        gap: '16px',
      }}>
        {filteredRecipes.map(recipe => (
          <div key={recipe.id} className="ent-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontWeight: 700 }}>
                    {recipe.id}
                  </span>
                  <span className="badge badge-brand">{recipe.category}</span>
                  <span className={`badge ${recipe.stockStatus === 'OPTIMAL' ? 'badge-clean' : 'badge-warning'}`}>
                    {recipe.stockStatus}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {recipe.name}
                </h3>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {formatNaira(recipe.sellingPrice)}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Menu Selling Price</div>
              </div>
            </div>

            {/* Financial Margin Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-subtle)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Food / Spirit Cost (COGS)</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--rose-primary)' }}>
                  {formatNaira(recipe.cogsCost)}
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Gross Profit Margin</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--emerald-primary)' }}>
                  {recipe.marginPercent}%
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Chef Sign-Off</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {recipe.chefSignOff}
                </div>
              </div>
            </div>

            {/* Itemized Recipe Bill of Materials Table */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                Portion Bill of Materials (Ingredients Deducted)
              </div>
              <div className="ent-table-container">
                <table className="ent-table">
                  <thead>
                    <tr>
                      <th>Ingredient Component</th>
                      <th>Portion Size</th>
                      <th style={{ textAlign: 'right' }}>Portion Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipe.ingredients.map((ing, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{ing.name}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{ing.quantity}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                          {formatNaira(ing.unitCost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} color="var(--emerald-primary)" />
                <span>Auto-deducts from stores upon POS fire</span>
              </div>
              <button
                onClick={() => {
                  showSuccess(
                    `Recipe Formulation: ${recipe.name}`,
                    `Current portion COGS: ₦${recipe.cogsCost.toLocaleString()} (${recipe.marginPercent}% gross margin).`,
                    `Approved by: ${recipe.chefSignOff} • Standard yield: 1 portion`
                  );
                }}
                style={{ background: 'transparent', color: 'var(--brand-primary)', fontWeight: 600, fontSize: '0.75rem' }}
              >
                Edit Portion Formulation →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
