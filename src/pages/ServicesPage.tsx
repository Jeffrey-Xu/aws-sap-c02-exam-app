import React, { useState, useMemo } from 'react';
import { Search, ChevronRight, ChevronDown, Cloud, Database, Shield, Cpu, Network, Globe, Users, Lightbulb, Settings, BookOpen, Award } from 'lucide-react';
import Card from '../components/common/Card';
import { awsServicesData } from '../data/awsServices';
import { architectGuideData } from '../data/architectGuide';

type ContentType = 'services' | 'architect';

const ServicesPage: React.FC = () => {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedGuideItem, setSelectedGuideItem] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['compute']));
  const [contentType, setContentType] = useState<ContentType>('services');

  const filteredServices = useMemo(() => {
    if (!searchTerm) return awsServicesData;
    
    const filtered: typeof awsServicesData = {};
    Object.entries(awsServicesData).forEach(([category, services]) => {
      const matchingServices = services.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.keyFeatures.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      if (matchingServices.length > 0) {
        filtered[category] = matchingServices;
      }
    });
    return filtered;
  }, [searchTerm]);

  const filteredGuideData = useMemo(() => {
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

  const getServiceCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      compute: <Cpu className="w-4 h-4" />,
      storage: <Database className="w-4 h-4" />,
      database: <Database className="w-4 h-4" />,
      networking: <Network className="w-4 h-4" />,
      security: <Shield className="w-4 h-4" />,
      analytics: <Globe className="w-4 h-4" />,
      'machine-learning': <Cloud className="w-4 h-4" />,
      'developer-tools': <Cpu className="w-4 h-4" />,
      management: <Shield className="w-4 h-4" />,
      integration: <Network className="w-4 h-4" />
    };
    return icons[category] || <Cloud className="w-4 h-4" />;
  };

  const getGuideCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      'core-competencies': <Users className="w-4 h-4" />,
      'methodologies': <Lightbulb className="w-4 h-4" />,
      'tools-technologies': <Settings className="w-4 h-4" />,
      'domain-expertise': <BookOpen className="w-4 h-4" />,
      'career-development': <Award className="w-4 h-4" />
    };
    return icons[category] || <BookOpen className="w-4 h-4" />;
  };

  const getServiceCategoryTitle = (category: string) => {
    const titles: Record<string, string> = {
      compute: 'Compute Services',
      storage: 'Storage Services',
      database: 'Database Services',
      networking: 'Networking & Content Delivery',
      security: 'Security, Identity & Compliance',
      analytics: 'Analytics',
      'machine-learning': 'Machine Learning',
      'developer-tools': 'Developer Tools',
      management: 'Management & Governance',
      integration: 'Application Integration'
    };
    return titles[category] || category.charAt(0).toUpperCase() + category.slice(1);
  };

  const getGuideCategoryTitle = (category: string) => {
    const titles: Record<string, string> = {
      'core-competencies': 'Core Competencies',
      'methodologies': 'Methodologies & Frameworks',
      'tools-technologies': 'Tools & Technologies',
      'domain-expertise': 'Domain Expertise',
      'career-development': 'Career Development'
    };
    return titles[category] || category.charAt(0).toUpperCase() + category.slice(1);
  };

  const renderServicesContent = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Services List */}
      <div className="lg:col-span-1">
        <div className="space-y-4">
          {Object.entries(filteredServices).map(([category, services]) => (
            <Card key={category} className="p-0">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  {getServiceCategoryIcon(category)}
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {getServiceCategoryTitle(category)}
                    </h3>
                    <p className="text-sm text-gray-500">{services.length} services</p>
                  </div>
                </div>
                {expandedCategories.has(category) ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>
              
              {expandedCategories.has(category) && (
                <div className="border-t border-gray-200">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => setSelectedService(service.id)}
                      className={`w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                        selectedService === service.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{service.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          <div className="flex items-center mt-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              service.tier === 'core' ? 'bg-red-100 text-red-800' :
                              service.tier === 'important' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {service.tier}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Service Details */}
      <div className="lg:col-span-2">
        {selectedService ? (
          <Card className="p-6">
            {(() => {
              const service = Object.values(filteredServices)
                .flat()
                .find(s => s.id === selectedService);
              
              if (!service) return <div>Service not found</div>;

              return (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">{service.name}</h2>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        service.tier === 'core' ? 'bg-red-100 text-red-800' :
                        service.tier === 'important' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {service.tier} service
                      </span>
                    </div>
                    <p className="text-gray-600">{service.description}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
                    <ul className="space-y-2">
                      {service.keyFeatures.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Common Use Cases</h3>
                    <ul className="space-y-2">
                      {service.useCases.map((useCase, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-gray-700">{useCase}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Pricing Model</h3>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{service.pricingModel}</p>
                  </div>

                  {service.examTips && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">SAP-C02 Exam Tips</h3>
                      <ul className="space-y-2">
                        {service.examTips.map((tip, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span className="text-gray-700">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {service.integrations && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Integrations</h3>
                      <div className="flex flex-wrap gap-2">
                        {service.integrations.map((integration, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                          >
                            {integration}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </Card>
        ) : (
          <Card className="p-8 text-center">
            <Cloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select an AWS Service</h3>
            <p className="text-gray-600">
              Choose a service from the left panel to view detailed information, features, and exam tips.
            </p>
          </Card>
        )}
      </div>
    </div>
  );

  const renderArchitectContent = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Guide List */}
      <div className="lg:col-span-1">
        <div className="space-y-4">
          {Object.entries(filteredGuideData).map(([category, items]) => (
            <Card key={category} className="p-0">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  {getGuideCategoryIcon(category)}
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {getGuideCategoryTitle(category)}
                    </h3>
                    <p className="text-sm text-gray-500">{items.length} topics</p>
                  </div>
                </div>
                {expandedCategories.has(category) ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>
              
              {expandedCategories.has(category) && (
                <div className="border-t border-gray-200">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedGuideItem(item.id)}
                      className={`w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                        selectedGuideItem === item.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{item.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          <div className="flex items-center mt-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              item.priority === 'essential' ? 'bg-red-100 text-red-800' :
                              item.priority === 'important' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {item.priority}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Guide Details */}
      <div className="lg:col-span-2">
        {selectedGuideItem ? (
          <Card className="p-6">
            {(() => {
              const item = Object.values(filteredGuideData)
                .flat()
                .find(i => i.id === selectedGuideItem);
              
              if (!item) return <div>Guide item not found</div>;

              return (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">{item.title}</h2>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        item.priority === 'essential' ? 'bg-red-100 text-red-800' :
                        item.priority === 'important' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-gray-600">{item.description}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Overview</h3>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{item.content.overview}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Points</h3>
                    <ul className="space-y-2">
                      {item.content.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-gray-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Practical Tips</h3>
                    <ul className="space-y-2">
                      {item.content.practicalTips.map((tip, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-gray-700">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {item.content.tools && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommended Tools</h3>
                      <ul className="space-y-2">
                        {item.content.tools.map((tool, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span className="text-gray-700">{tool}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.content.checklist && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Checklist</h3>
                      <ul className="space-y-2">
                        {item.content.checklist.map((checkItem, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span className="text-gray-700">{checkItem}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })()}
          </Card>
        ) : (
          <Card className="p-8 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Guide Topic</h3>
            <p className="text-gray-600">
              Choose a topic from the left panel to view detailed guidance and best practices.
            </p>
          </Card>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AWS Services & Architecture Guide</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive reference for AWS services and solution architecture best practices
          </p>
        </div>
      </div>

      {/* Content Type Toggle */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => {
            setContentType('services');
            setSelectedService(null);
            setSelectedGuideItem(null);
            setExpandedCategories(new Set(['compute']));
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            contentType === 'services'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Cloud className="w-4 h-4 inline mr-2" />
          AWS Services
        </button>
        <button
          onClick={() => {
            setContentType('architect');
            setSelectedService(null);
            setSelectedGuideItem(null);
            setExpandedCategories(new Set(['core-competencies']));
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            contentType === 'architect'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Architecture Guide
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder={`Search ${contentType === 'services' ? 'AWS services' : 'architecture topics'}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Content */}
      {contentType === 'services' ? renderServicesContent() : renderArchitectContent()}
    </div>
  );
};

export default ServicesPage;
