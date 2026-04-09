'use client';

import React from 'react';

export interface CVData {
    personalInfo: {
        fullName: string;
        jobTitle: string;
        email: string;
        phone: string;
        location: string;
        linkedin?: string;
    };
    summary: string;
    experience: Array<{
        role: string;
        company: string;
        period: string;
        achievements: string[];
    }>;
    education: Array<{
        degree: string;
        institution: string;
        period: string;
    }>;
    skills: string[];
}

export function CVTemplateProfessional({ data }: { data: CVData }) {
    if (!data) return null;

    const { personalInfo, summary, experience, education, skills } = data;

    return (
        <div 
            id="cv-export-wrapper" 
            className="w-full bg-white text-gray-800 shadow-2xl overflow-hidden font-sans border border-gray-100"
            style={{ 
                width: '100%', 
                minHeight: '297mm', // A4 aspect logic (we will scale it if needed)
                boxSizing: 'border-box'
            }}
        >
            {/* Header / Header Banner */}
            <div className="bg-[var(--color-earth-dark)] text-white p-8 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-gold)] opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--color-savanna)] opacity-20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />
                
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                    {personalInfo?.fullName || 'Prénom Nom'}
                </h1>
                <h2 className="text-xl md:text-2xl text-[var(--color-gold)] font-medium tracking-wide">
                    {personalInfo?.jobTitle || 'Titre du poste'}
                </h2>
                
                <div className="mt-6 flex flex-wrap gap-4 text-sm font-medium text-[var(--color-cream)]">
                    {personalInfo?.email && (
                        <div className="flex items-center gap-1.5 opacity-90">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            {personalInfo.email}
                        </div>
                    )}
                    {personalInfo?.phone && (
                        <div className="flex items-center gap-1.5 opacity-90">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            {personalInfo.phone}
                        </div>
                    )}
                    {personalInfo?.location && (
                        <div className="flex items-center gap-1.5 opacity-90">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {personalInfo.location}
                        </div>
                    )}
                </div>
            </div>

            {/* Content Body */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 md:p-12">
                {/* Left Column (Main Content) */}
                <div className="md:col-span-2 space-y-10">
                    
                    {/* Summary */}
                    {summary && (
                        <section>
                            <h3 className="text-xl font-bold border-b-2 border-[var(--color-savanna)] pb-2 mb-4 text-[var(--color-earth-dark)] uppercase tracking-wider text-sm flex items-center gap-2">
                                <svg className="w-5 h-5 text-[var(--color-savanna)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                Profil Professionnel
                            </h3>
                            <p className="text-gray-700 leading-relaxed text-[15px]">
                                {summary}
                            </p>
                        </section>
                    )}

                    {/* Experience */}
                    {experience && experience.length > 0 && (
                        <section>
                            <h3 className="text-xl font-bold border-b-2 border-[var(--color-savanna)] pb-2 mb-6 text-[var(--color-earth-dark)] uppercase tracking-wider text-sm flex items-center gap-2">
                                <svg className="w-5 h-5 text-[var(--color-savanna)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                Expériences
                            </h3>
                            <div className="space-y-6">
                                {experience.map((exp, idx) => (
                                    <div key={idx} className="relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-800">{exp.role}</h4>
                                                <p className="text-sm font-semibold text-[var(--color-terracotta)]">{exp.company}</p>
                                            </div>
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium whitespace-nowrap">
                                                {exp.period}
                                            </span>
                                        </div>
                                        <ul className="list-none space-y-1.5 mt-3">
                                            {exp.achievements?.map((ach, i) => (
                                                <li key={i} className="text-[15px] text-gray-700 relative pl-4">
                                                    <span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-[var(--color-gold)]" />
                                                    {ach}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Right Column (Sidebar) */}
                <div className="space-y-10">
                    
                    {/* Skills */}
                    {skills && skills.length > 0 && (
                        <section>
                            <h3 className="text-xl font-bold border-b-2 border-[var(--color-savanna)] pb-2 mb-4 text-[var(--color-earth-dark)] uppercase tracking-wider text-sm flex items-center gap-2">
                                <svg className="w-5 h-5 text-[var(--color-savanna)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                Compétences
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {skills.map((skill, idx) => (
                                    <span key={idx} className="bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1 rounded-lg text-sm">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Education */}
                    {education && education.length > 0 && (
                        <section>
                            <h3 className="text-xl font-bold border-b-2 border-[var(--color-savanna)] pb-2 mb-6 text-[var(--color-earth-dark)] uppercase tracking-wider text-sm flex items-center gap-2">
                                <svg className="w-5 h-5 text-[var(--color-savanna)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                                Formation
                            </h3>
                            <div className="space-y-4">
                                {education.map((edu, idx) => (
                                    <div key={idx} className="relative">
                                        <h4 className="text-base font-bold text-gray-800 leading-tight mb-1">{edu.degree}</h4>
                                        <p className="text-sm font-medium text-gray-600 leading-tight">{edu.institution}</p>
                                        <span className="text-xs text-gray-500 mt-1 block">{edu.period}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}
