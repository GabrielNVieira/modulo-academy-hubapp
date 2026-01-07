import { useState, useEffect, useMemo } from 'react';
import { useMobile } from '../components/ui/use-mobile';
import { GenericSearchModal } from '../components/generic/GenericSearchModal';
import { BaseSearchSystemProps, ModuleSearchResult } from './types/module-config';

export function BaseSearchSystem({ 
  config, 
  data, 
  onResults, 
  onSelect, 
  isOpen, 
  onClose 
}: BaseSearchSystemProps) {
  const isMobile = useMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ModuleSearchResult[]>([]);

  // Função de busca genérica
  const performSearch = useMemo(() => {
    return (query: string): ModuleSearchResult[] => {
      if (!query.trim()) return [];

      const searchTerm = query.toLowerCase();
      const results: ModuleSearchResult[] = [];

      data.forEach((item) => {
        let matches = false;
        let score = 0;

        // Buscar nos campos configurados
        config.searchFields.forEach((field) => {
          const fieldValue = getNestedValue(item, field);
          if (fieldValue && fieldValue.toString().toLowerCase().includes(searchTerm)) {
            matches = true;
            // Dar pontuação maior para matches exatos no início
            if (fieldValue.toString().toLowerCase().startsWith(searchTerm)) {
              score += 10;
            } else {
              score += 5;
            }
          }
        });

        if (matches) {
          results.push({
            id: item.id,
            title: getNestedValue(item, 'title') || getNestedValue(item, 'name') || 'Item',
            subtitle: getNestedValue(item, 'subtitle') || getNestedValue(item, 'description'),
            category: determineCategory(item, config.categories),
            data: item
          });
        }
      });

      // Ordenar por score (relevância)
      return results.sort((a, b) => {
        const scoreA = calculateRelevanceScore(a, searchTerm);
        const scoreB = calculateRelevanceScore(b, searchTerm);
        return scoreB - scoreA;
      });
    };
  }, [data, config.searchFields, config.categories]);

  // Atualizar resultados quando query muda
  useEffect(() => {
    const results = performSearch(searchQuery);
    setSearchResults(results);
    onResults(results);
  }, [searchQuery, performSearch, onResults]);

  // Resetar busca quando modal fecha
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [isOpen]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleSelect = (result: ModuleSearchResult) => {
    onSelect(result);
    onClose();
  };

  return (
    <GenericSearchModal
      isOpen={isOpen}
      onClose={onClose}
      data={searchResults.map(r => r.data)}
      onSelectItem={(item) => {
        const result = searchResults.find(r => r.data.id === item.id);
        if (result) handleSelect(result);
      }}
      searchPlaceholder={config.placeholder}
      onSearchChange={handleSearchChange}
      searchQuery={searchQuery}
      categories={config.categories}
      isMobile={isMobile}
    />
  );
}

// Função auxiliar para acessar valores aninhados
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Função para determinar categoria automaticamente
function determineCategory(item: any, categories: string[]): string {
  // Tentar determinar categoria baseado nos campos do item
  if (item.category) return item.category;
  if (item.type) return item.type;
  if (item.status) return item.status;
  
  // Fallback para primeira categoria disponível
  return categories[0] || 'Geral';
}

// Calcular score de relevância
function calculateRelevanceScore(result: ModuleSearchResult, searchTerm: string): number {
  let score = 0;
  const term = searchTerm.toLowerCase();
  
  // Título tem peso maior
  if (result.title.toLowerCase().includes(term)) {
    score += result.title.toLowerCase().startsWith(term) ? 20 : 10;
  }
  
  // Subtítulo tem peso menor
  if (result.subtitle?.toLowerCase().includes(term)) {
    score += result.subtitle.toLowerCase().startsWith(term) ? 10 : 5;
  }
  
  // Categoria tem peso baixo
  if (result.category.toLowerCase().includes(term)) {
    score += 3;
  }
  
  return score;
}

// Hook para gerenciar busca
export function useSearch<T = any>() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const search = async (
    data: T[], 
    searchFields: string[], 
    searchTerm: string
  ): Promise<T[]> => {
    setIsSearching(true);
    
    try {
      // Simular delay de busca para UX
      await new Promise(resolve => setTimeout(resolve, 150));
      
      if (!searchTerm.trim()) {
        setResults([]);
        return [];
      }

      const term = searchTerm.toLowerCase();
      const filtered = data.filter((item: any) => {
        return searchFields.some(field => {
          const value = getNestedValue(item, field);
          return value && value.toString().toLowerCase().includes(term);
        });
      });

      setResults(filtered);
      return filtered;
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  return {
    query,
    setQuery,
    results,
    isSearching,
    search,
    clearSearch
  };
}