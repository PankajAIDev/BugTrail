import React, { useState, useMemo } from 'react';
import { Search, CheckCircle2, ChevronRight, Filter, Code2, AlertCircle, X, BookOpen } from 'lucide-react';
import { Challenge, Language, Difficulty } from '../types';
import { CHALLENGES, ALL_CATEGORIES } from '../data/challenges';

interface LibraryViewProps {
  completedIds: string[];
  onSelectChallenge: (challengeId: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  completedIds,
  onSelectChallenge
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | Language>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | Difficulty>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter challenges dynamically
  const filteredChallenges = useMemo(() => {
    return CHALLENGES.filter((c) => {
      if (selectedLanguage !== 'all' && c.language !== selectedLanguage) return false;
      if (selectedDifficulty !== 'all' && c.difficulty !== selectedDifficulty) return false;
      if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = c.title.toLowerCase().includes(query);
        const matchesDesc = c.description.toLowerCase().includes(query);
        const matchesCat = c.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesCat) return false;
      }
      return true;
    });
  }, [selectedLanguage, selectedDifficulty, selectedCategory, searchQuery]);

  const clearAllFilters = () => {
    setSelectedLanguage('all');
    setSelectedDifficulty('all');
    setSelectedCategory('all');
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedLanguage !== 'all' ||
    selectedDifficulty !== 'all' ||
    selectedCategory !== 'all' ||
    searchQuery.trim() !== '';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ADDCE8] border-2 border-[#2F2E33] rounded-full shadow-[2px_2px_0px_#2F2E33] text-xs font-extrabold text-[#2F2E33] mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Interactive Catalog</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-[#2F2E33]">
            Debug Challenge Library
          </h1>
          <p className="text-xs sm:text-sm font-bold text-[#858B98] mt-1">
            Curated C and Python debugging exercises. Select a scenario to analyze and solve.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono font-extrabold text-[#2F2E33]">
          <span>
            Showing <span className="text-[#24C566] bg-white px-2 py-0.5 border border-[#2F2E33] rounded">{filteredChallenges.length}</span> of {CHALLENGES.length}
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-[#2F2E33] underline font-extrabold flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="card-brutal p-5 space-y-4">
        
        {/* Search & Language Tabs */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#858B98] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bug title, concept, or keyword..."
              className="w-full pl-10 pr-10 py-2.5 bg-[#FFF9F4] border-2 border-[#2F2E33] rounded-xl text-xs font-bold text-[#2F2E33] placeholder:text-[#858B98] focus:outline-none focus:ring-2 focus:ring-[#24C566] shadow-[2px_2px_0px_#2F2E33]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#858B98] hover:text-[#2F2E33]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1 p-1 bg-[#E4E1DF] border-2 border-[#2F2E33] rounded-xl shrink-0 w-full sm:w-auto">
            {(['all', 'c', 'python'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`flex-1 sm:flex-none px-4 py-2 text-xs font-extrabold rounded-lg transition-all ${
                  selectedLanguage === lang
                    ? 'bg-[#24C566] text-[#2F2E33] border-2 border-[#2F2E33] shadow-[2px_2px_0px_#2F2E33]'
                    : 'text-[#2F2E33] hover:text-[#000000]'
                }`}
              >
                {lang === 'all' ? 'All Languages' : lang === 'c' ? 'C Programming' : 'Python'}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty & Category Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t-2 border-[#E4E1DF]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-extrabold text-[#2F2E33] flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Difficulty:</span>
            </span>
            {(['all', 'Beginner', 'Intermediate', 'Advanced'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all ${
                  selectedDifficulty === diff
                    ? 'bg-[#ADDCE8] text-[#2F2E33] border-2 border-[#2F2E33] shadow-[2px_2px_0px_#2F2E33]'
                    : 'bg-[#FFF9F4] text-[#2F2E33] border border-[#2F2E33] hover:bg-[#E4E1DF]'
                }`}
              >
                {diff === 'all' ? 'Any' : diff}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-extrabold text-[#2F2E33]">Topic:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold bg-[#FFF9F4] border-2 border-[#2F2E33] rounded-xl text-[#2F2E33] focus:outline-none focus:ring-2 focus:ring-[#24C566] shadow-[2px_2px_0px_#2F2E33]"
            >
              <option value="all">All Bug Categories</option>
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Challenge Grid */}
      {filteredChallenges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge) => {
            const isCompleted = completedIds.includes(challenge.id);

            return (
              <div
                key={challenge.id}
                onClick={() => onSelectChallenge(challenge.id)}
                className={`card-brutal p-5 flex flex-col justify-between cursor-pointer hover:-translate-y-1 hover:shadow-[6px_6px_0px_#2F2E33] transition-all group ${
                  isCompleted ? 'bg-[#9AF7A0]/20' : 'bg-white'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-0.5 text-xs font-mono font-extrabold uppercase rounded-lg border-2 border-[#2F2E33] ${
                      challenge.language === 'c' ? 'bg-[#FFB8B0]' : 'bg-[#9AF7A0]'
                    }`}>
                      {challenge.language}
                    </span>

                    <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-lg bg-[#E5E0FA] border-2 border-[#2F2E33]">
                      {challenge.difficulty}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold font-display text-[#2F2E33] group-hover:text-[#24C566] transition-colors">
                    {challenge.title}
                  </h3>

                  <p className="text-xs font-bold text-[#858B98] line-clamp-2 leading-relaxed">
                    {challenge.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t-2 border-[#E4E1DF] flex items-center justify-between">
                  <span className="text-xs font-mono font-extrabold text-[#2F2E33]">
                    +{challenge.xpReward} XP
                  </span>

                  {isCompleted ? (
                    <span className="text-xs font-extrabold text-[#24C566] flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Solved</span>
                    </span>
                  ) : (
                    <span className="text-xs font-extrabold text-[#2F2E33] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Debug Challenge &rarr;
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty Filter State */
        <div className="card-brutal p-12 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-[#FFB8B0] mx-auto" />
          <h3 className="text-lg font-extrabold font-display text-[#2F2E33]">No challenges match your criteria</h3>
          <p className="text-xs font-bold text-[#858B98] max-w-sm mx-auto">
            Try adjusting search terms or clearing language/difficulty filters.
          </p>
          <button
            onClick={clearAllFilters}
            className="btn-primary text-xs py-2.5 px-4 mt-2"
          >
            Clear All Filters
          </button>
        </div>
      )}

    </div>
  );
};
