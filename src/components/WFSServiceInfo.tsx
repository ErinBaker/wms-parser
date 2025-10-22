import React from 'react';
import { WFSServiceData } from '../types';
import { Info, Mail, Phone, ExternalLink } from 'lucide-react';

interface WFSServiceInfoProps {
  service: WFSServiceData;
}

export default function WFSServiceInfo({ service }: WFSServiceInfoProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-800">{service.title}</h2>
      </div>

      {service.abstract && (
        <p className="text-gray-600 mb-4">{service.abstract}</p>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {service.keywords && service.keywords.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {service.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {service.providerName && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Provider</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>{service.providerName}</p>
              {service.providerSite && (
                <p className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  <a href={service.providerSite} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {service.providerSite}
                  </a>
                </p>
              )}
            </div>
          </div>
        )}

        {service.contact && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Contact Information</h3>
            <div className="space-y-2 text-sm text-gray-600">
              {service.contact.person && (
                <p>{service.contact.person} {service.contact.organization && `- ${service.contact.organization}`}</p>
              )}
              {service.contact.position && (
                <p className="text-gray-500">{service.contact.position}</p>
              )}
              {service.contact.email && (
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${service.contact.email}`} className="text-blue-600 hover:underline">
                    {service.contact.email}
                  </a>
                </p>
              )}
              {service.contact.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {service.contact.phone}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {(service.fees || service.accessConstraints) && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
          {service.fees && (
            <p><span className="font-medium">Fees:</span> {service.fees}</p>
          )}
          {service.accessConstraints && (
            <p className="mt-2"><span className="font-medium">Access Constraints:</span> {service.accessConstraints}</p>
          )}
        </div>
      )}
    </div>
  );
}
