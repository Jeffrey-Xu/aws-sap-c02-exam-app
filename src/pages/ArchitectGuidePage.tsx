import React, { useState, useMemo } from 'react';
import { Search, ChevronRight, ChevronDown, Users, Lightbulb, Settings, BookOpen, Award, TrendingUp } from 'lucide-react';
import Card from '../components/common/Card';
import { architectGuideData } from '../data/architectGuide';

const ArchitectGuidePage: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['core-competencies']));

  const filteredData = useMemo(() => {
    if (!searchTerm) return architectGuideData;
    
    const filtered: typeof architectGuideData = {};
    Object.entries(architectGuideData).forEach(([category, items]) => {
      const matchingItems = items.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.keyPoints.some(point => point.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      if (matchingItems.length > 0) {
        filtered[category] = matchingItems;
      }
    });
    return filtered;
  }, [searchTerm]);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      'core-competencies': <Users className="w-4 h-4" />,
      'methodologies': <Lightbulb className="w-4 h-4" />,
      'tools-technologies': <Settings className="w-4 h-4" />,
      'domain-expertise': <BookOpen className="w-4 h-4" />,
      'career-development': <Award className="w-4 h-4" />
    };
    return icons[category] || <BookOpen className="w-4 h-4" />;
  };

  const getCategoryTitle = (category: string) => {
    const titles: Record<string, string> = {
      'core-competencies': 'Core Competencies',
      'methodologies': 'Methodologies & Frameworks',
      'tools-technologies': 'Tools & Technologies',
      'domain-expertise': 'Domain Expertise',
      'career-development': 'Career Development'
    };
    return titles[category] || category;
  };

  const selectedItemData = useMemo(() => {
    if (!selectedItem) return null;
    for (const items of Object.values(filteredData)) {
      const item = items.find(i => i.id === selectedItem);
      if (item) return item;
    }
    return null;
  }, [selectedItem, filteredData]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'essential': return 'bg-red-100 text-red-800';
      case 'important': return 'bg-orange-100 text-orange-800';
      case 'advanced': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cloud Solution Architect Guide</h1>
              <p className="mt-2 text-gray-600">Comprehensive guide for professional cloud solution architects across all major platforms</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <TrendingUp className="w-4 h-4" />
              <span>{Object.values(filteredData).reduce((acc, items) => acc + items.length, 0)} Topics</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 h-[calc(100vh-200px)]">
          {/* Left Panel - Guide Navigation */}
          <div className="w-1/3 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search architect topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Guide Tree */}
            <div className="flex-1 overflow-y-auto">
              {Object.entries(filteredData).map(([category, items]) => (
                <div key={category} className="border-b border-gray-100 last:border-b-0">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 text-left"
                  >
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(category)}
                      <span className="font-medium text-gray-900">
                        {getCategoryTitle(category)}
                      </span>
                      <span className="text-xs text-gray-500">({items.length})</span>
                    </div>
                    {expandedCategories.has(category) ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  
                  {expandedCategories.has(category) && (
                    <div className="bg-gray-50">
                      {items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSelectedItem(item.id)}
                          className={`w-full text-left px-6 py-3 hover:bg-gray-100 border-l-2 transition-colors ${
                            selectedItem === item.id
                              ? 'border-orange-500 bg-orange-50 text-orange-900'
                              : 'border-transparent text-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-medium">{item.title}</div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                              {item.priority}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 line-clamp-2">{item.description}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Content Details */}
          <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200">
            {selectedItemData ? (
              <div className="h-full overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedItemData.title}</h2>
                      <p className="mt-2 text-gray-600">{selectedItemData.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedItemData.priority)}`}>
                      {selectedItemData.priority.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Overview */}
                  <Card>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Overview</h3>
                    <p className="text-gray-700">{selectedItemData.content.overview}</p>
                  </Card>

                  {/* Key Points */}
                  <Card>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Points</h3>
                    <ul className="space-y-2">
                      {selectedItemData.content.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  {/* Practical Tips */}
                  <Card className="bg-green-50 border-green-200">
                    <h3 className="text-lg font-semibold text-green-900 mb-3">💡 Practical Tips</h3>
                    <ul className="space-y-2">
                      {selectedItemData.content.practicalTips.map((tip, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-green-800">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  {/* Tools */}
                  {selectedItemData.content.tools && selectedItemData.content.tools.length > 0 && (
                    <Card>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">🛠️ Recommended Tools</h3>
                      <ul className="space-y-2">
                        {selectedItemData.content.tools.map((tool, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">{tool}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}

                  {/* Resources */}
                  {selectedItemData.content.resources && selectedItemData.content.resources.length > 0 && (
                    <Card>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">📚 Learning Resources</h3>
                      <ul className="space-y-2">
                        {selectedItemData.content.resources.map((resource, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">{resource}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}

                  {/* Checklist */}
                  {selectedItemData.content.checklist && selectedItemData.content.checklist.length > 0 && (
                    <Card className="bg-yellow-50 border-yellow-200">
                      <h3 className="text-lg font-semibold text-yellow-900 mb-3">✅ Competency Checklist</h3>
                      <ul className="space-y-2">
                        {selectedItemData.content.checklist.map((item, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-yellow-800">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Topic</h3>
                  <p className="text-gray-600">Choose a topic from the left panel to view detailed guidance</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchitectGuidePage;
