import React, { useState, useMemo } from 'react';
import { Search, ChevronRight, ChevronDown, Cloud, Database, Shield, Cpu, Network, Globe } from 'lucide-react';
import Card from '../components/common/Card';
import { awsServicesData } from '../data/awsServices';

const ServicesPage: React.FC = () => {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['compute']));

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

  const selectedServiceData = useMemo(() => {
    if (!selectedService) return null;
    for (const services of Object.values(filteredServices)) {
      const service = services.find(s => s.id === selectedService);
      if (service) return service;
    }
    return null;
  }, [selectedService, filteredServices]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AWS Reference Guide</h1>
              <p className="mt-2 text-gray-600">Comprehensive AWS services reference with multi-cloud comparisons for SAP-C02 exam preparation</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Cloud className="w-4 h-4" />
              <span>{Object.values(filteredServices).reduce((acc, services) => acc + services.length, 0)} Services</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 h-[calc(100vh-200px)]">
          {/* Left Panel - Services Tree */}
          <div className="w-1/3 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search AWS services and features..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Services Tree */}
            <div className="flex-1 overflow-y-auto">
              {Object.entries(filteredServices).map(([category, services]) => (
                <div key={category} className="border-b border-gray-100 last:border-b-0">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 text-left"
                  >
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(category)}
                      <span className="font-medium text-gray-900 capitalize">
                        {category.replace('-', ' ')}
                      </span>
                      <span className="text-xs text-gray-500">({services.length})</span>
                    </div>
                    {expandedCategories.has(category) ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  
                  {expandedCategories.has(category) && (
                    <div className="bg-gray-50">
                      {services.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => setSelectedService(service.id)}
                          className={`w-full text-left px-6 py-2 hover:bg-gray-100 border-l-2 transition-colors ${
                            selectedService === service.id
                              ? 'border-orange-500 bg-orange-50 text-orange-900'
                              : 'border-transparent text-gray-700'
                          }`}
                        >
                          <div className="font-medium">{service.name}</div>
                          <div className="text-xs text-gray-500 truncate">{service.description}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Service Details */}
          <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200">
            {selectedServiceData ? (
              <div className="h-full overflow-y-auto">
                {/* Service Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedServiceData.name}</h2>
                      <p className="mt-2 text-gray-600">{selectedServiceData.description}</p>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedServiceData.tier === 'core' ? 'bg-red-100 text-red-800' :
                        selectedServiceData.tier === 'important' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedServiceData.tier?.toUpperCase()} SERVICE
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Key Features */}
                  <Card>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
                    <ul className="space-y-2">
                      {selectedServiceData.keyFeatures.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  {/* Use Cases */}
                  <Card>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Common Use Cases</h3>
                    <ul className="space-y-2">
                      {selectedServiceData.useCases.map((useCase, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">{useCase}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  {/* Pricing Model */}
                  <Card>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Pricing Model</h3>
                    <p className="text-gray-700">{selectedServiceData.pricingModel}</p>
                  </Card>

                  {/* Integration Points */}
                  {selectedServiceData.integrations && selectedServiceData.integrations.length > 0 && (
                    <Card>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Integrations</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedServiceData.integrations.map((integration, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            {integration}
                          </span>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Exam Tips */}
                  {selectedServiceData.examTips && selectedServiceData.examTips.length > 0 && (
                    <Card className="bg-yellow-50 border-yellow-200">
                      <h3 className="text-lg font-semibold text-yellow-900 mb-3">💡 SAP-C02 Exam Tips</h3>
                      <ul className="space-y-2">
                        {selectedServiceData.examTips.map((tip, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-yellow-800">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}

                  {/* Limits and Quotas */}
                  {selectedServiceData.limits && selectedServiceData.limits.length > 0 && (
                    <Card>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Limits & Quotas</h3>
                      <ul className="space-y-2">
                        {selectedServiceData.limits.map((limit, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">{limit}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}

                  {/* Cloud Provider Comparisons */}
                  {selectedServiceData.cloudComparisons && (
                    <Card className="bg-blue-50 border-blue-200">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">🌐 Equivalent Services in Other Clouds</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {selectedServiceData.cloudComparisons.googleCloud && (
                          <div className="bg-white rounded-lg p-3 border border-blue-100">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                              <span className="font-medium text-gray-900">Google Cloud</span>
                            </div>
                            <p className="text-sm text-gray-700">{selectedServiceData.cloudComparisons.googleCloud}</p>
                          </div>
                        )}
                        {selectedServiceData.cloudComparisons.azure && (
                          <div className="bg-white rounded-lg p-3 border border-blue-100">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                              <span className="font-medium text-gray-900">Microsoft Azure</span>
                            </div>
                            <p className="text-sm text-gray-700">{selectedServiceData.cloudComparisons.azure}</p>
                          </div>
                        )}
                        {selectedServiceData.cloudComparisons.alibabaCloud && (
                          <div className="bg-white rounded-lg p-3 border border-blue-100">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                              <span className="font-medium text-gray-900">Alibaba Cloud</span>
                            </div>
                            <p className="text-sm text-gray-700">{selectedServiceData.cloudComparisons.alibabaCloud}</p>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 text-xs text-blue-700">
                        💡 Understanding equivalent services helps with multi-cloud strategies and cloud migration scenarios
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Cloud className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select an AWS Service</h3>
                  <p className="text-gray-600">Choose a service from the left panel to view detailed reference information</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
