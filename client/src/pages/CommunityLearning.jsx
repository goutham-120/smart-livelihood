import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useLang } from '../lang.js';
import {
  Search, Users, BookOpen, Briefcase, Calendar, MapPin, Sparkles, Clock,
  ArrowRight, Video, FileText, CheckCircle, Building2, Filter, GraduationCap,
  HeartHandshake, X, ChevronRight, Award, ExternalLink, ShieldCheck
} from 'lucide-react';

export function CommunityLearning() {
  const { lang, t } = useLang();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // all, announcements, stories, videos, people
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [modalItem, setModalItem] = useState(null);

  useEffect(() => {
    let mounted = true;
    api.getProfile()
      .then((res) => {
        if (!mounted) return;
        const p = res?.profile || res?.data?.profile || res?.data || {};
        setProfile(p);
        setLoading(false);
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  // Beneficiary personalization extracted info
  const userSkills = useMemo(() => {
    if (!profile) return ['Sewing Machine Operation'];
    if (Array.isArray(profile.skills) && profile.skills.length > 0) {
      return profile.skills;
    }
    return ['Sewing Machine Operation', 'Basic Tailoring'];
  }, [profile]);

  const userOccupation = useMemo(() => {
    return profile?.primaryOccupation || profile?.extractedInfo?.targetRole || 'Tailor / Garment Worker';
  }, [profile]);

  const userSkillGaps = useMemo(() => {
    const gaps = profile?.extractedInfo?.skillGaps || profile?.skillGaps;
    if (Array.isArray(gaps) && gaps.length > 0) return gaps;
    return ['Garment Pattern Cutting', 'Quality Inspection'];
  }, [profile]);

  const primarySkillGap = userSkillGaps[0] || 'Garment Pattern Cutting';

  // Section A: Opportunities & Announcements
  const announcements = [
    {
      id: 'ann-1',
      category: 'announcements',
      type: 'Skill Development Camp',
      title: 'Tailoring & Industrial Garment Skill Development Drive',
      location: 'Warangal, Telangana',
      date: 'Oct 15 - Oct 25, 2026',
      skill: 'Garment Pattern Cutting',
      skillGroup: 'tailoring',
      description: 'Free 10-day practical training camp focusing on industrial sewing machine operation, fabric drafting, pattern cutting, and quality control under PM-AJAY.',
      badge: 'Free PM-AJAY Training',
      details: 'This 10-day intensive workshop takes place at the Hanamkonda District Skill Hub. Free materials, certified instructors, and transportation stipends provided for eligible SC beneficiaries.',
      actionLabel: 'View Details'
    },
    {
      id: 'ann-2',
      category: 'announcements',
      type: 'Apprenticeship Drive',
      title: 'Solar Equipment Installation & Maintenance Workshop',
      location: 'Karimnagar, Telangana',
      date: 'Nov 01 - Nov 15, 2026',
      skill: 'Electrical Repair & Solar',
      skillGroup: 'electrical',
      description: 'Hands-on practical apprenticeship with accredited DISCOM technicians. Focuses on inverter wiring, solar controller testing, and safety protocols.',
      badge: 'Stipend Included',
      details: 'Accredited 15-day practical module designed for youth seeking practical field experience in solar pump maintenance and electrical diagnostics.',
      actionLabel: 'View Details'
    },
    {
      id: 'ann-3',
      category: 'announcements',
      type: 'Market Access & Exhibition',
      title: 'Micro-Enterprise Handloom & Artisan Products Expo',
      location: 'Hyderabad, Telangana',
      date: 'Oct 28 - Oct 30, 2026',
      skill: 'Tailoring & Micro-Business',
      skillGroup: 'tailoring',
      description: 'Exhibition space provided for SC micro-entrepreneurs and SHG tailoring collectives to market finished garments directly to commercial buyers.',
      badge: 'Market Linkage',
      details: 'PM-AJAY sponsored stalls allowing local artisan groups to showcase stitched garments, handicrafts, and value-added textiles.',
      actionLabel: 'View Details'
    },
    {
      id: 'ann-4',
      category: 'announcements',
      type: 'Direct Placement Drive',
      title: 'District Retail & Customer Facilitation Hiring Camp',
      location: 'Khammam, Telangana',
      date: 'Nov 05, 2026',
      skill: 'Retail & Digital Business',
      skillGroup: 'business',
      description: 'On-spot hiring and certification verification drive for trained beneficiaries in retail operations, customer service, and digital store management.',
      badge: 'Direct Hiring',
      details: 'Organized by the District Employment Desk bringing together 12 verified local employers offering entry-level retail and billing roles.',
      actionLabel: 'View Details'
    }
  ];

  // Section B: Stories & Articles
  const stories = [
    {
      id: 'story-1',
      category: 'stories',
      type: 'Beneficiary Case Study',
      title: 'How a Tailoring Skill Became a Home-Based Enterprise',
      summary: 'Discover how Smt. Lakshmi from Warangal mastered garment pattern cutting through PM-AJAY skill camps to launch her custom tailoring unit serving 50+ local families.',
      readingTime: '4 min read',
      skill: 'Garment Pattern Cutting',
      skillGroup: 'tailoring',
      author: 'District Livelihood Cell',
      details: 'Lakshmi started with basic home stitching experience. After identifying her competency gap in garment pattern cutting through the AI Assistant, she enrolled in a 14-day PM-AJAY workshop. Today she operates a 2-machine micro-unit and mentors 3 younger women in her village.',
      actionLabel: 'Read Article'
    },
    {
      id: 'story-2',
      category: 'stories',
      type: 'Practical Trade Guide',
      title: 'From Skill Gap to NSQF Industry Certification',
      summary: 'A clear step-by-step breakdown of how NSQF-level trade certifications work, why QP-NOS codes matter for government subsidies, and how to pass practical trade assessments.',
      readingTime: '5 min read',
      skill: 'Skill Certification',
      skillGroup: 'tailoring',
      author: 'NSDC Technical Advisory',
      details: 'Understanding trade qualifications: 1. Identify your missing QP modules, 2. Attend 40-hour refresher practicals, 3. Complete third-party assessor evaluation, 4. Receive Skill India digital certificate linked to PM-AJAY grants.',
      actionLabel: 'Read Article'
    },
    {
      id: 'story-3',
      category: 'stories',
      type: 'Apprenticeship Guide',
      title: 'Building Practical Experience Before Your First Job',
      summary: 'Actionable techniques for pairing with senior master artisans, joining local SHG production units, and building a physical portfolio of completed work.',
      readingTime: '3 min read',
      skill: 'Apprenticeship & Practice',
      skillGroup: 'business',
      author: 'Skill India Mentor Desk',
      details: 'Key steps for early-stage learners: Offer assistance during peak festival seasons to local tailor shops, document your pattern drafts in a notebook, and join weekly SHG learning circles.',
      actionLabel: 'Read Article'
    },
    {
      id: 'story-4',
      category: 'stories',
      type: 'Enterprise Success Story',
      title: 'Establishing a Rural Solar Repair Hub',
      summary: 'How three youth combined PM-AJAY micro-grants and technical solar pump training to set up a village repair service supporting local farmers.',
      readingTime: '6 min read',
      skill: 'Electrical Repair & Solar',
      skillGroup: 'electrical',
      author: 'Rural Innovation Desk',
      details: 'Case study demonstrating how combining technical certification with micro-enterprise grant applications creates sustainable self-employment in rural clusters.',
      actionLabel: 'Read Article'
    }
  ];

  // Section C: Learn Through Videos & Resources
  const videos = [
    {
      id: 'vid-1',
      category: 'videos',
      type: 'Video Tutorial',
      title: 'Garment Pattern Cutting & Measurement Drafting Basics',
      source: 'Skill India Digital / NCVET Certified Module',
      skill: 'Garment Pattern Cutting',
      skillGroup: 'tailoring',
      description: 'Comprehensive step-by-step video guide explaining standard body measurements, neck drafting, armhole shaping, and fabric layout to eliminate cloth wastage.',
      badge: 'Practical Video Guide',
      details: 'Step 1: Take chest and shoulder measurements with seam allowance. Step 2: Draft paper template using L-square ruler. Step 3: Pin pattern to fabric along grainline.',
      actionLabel: 'Watch / Learn'
    },
    {
      id: 'vid-2',
      category: 'videos',
      type: 'Practical Walkthrough',
      title: 'Industrial Sewing Machine Operation & Safety Maintenance',
      source: 'PM-AJAY Technical Learning Library',
      skill: 'Sewing Machine Operation',
      skillGroup: 'tailoring',
      description: 'Practical walkthrough covering motor speed control, bobbin winding, needle sizing for different fabric GSM, thread tension adjustment, and daily oiling routines.',
      badge: 'Equipment Tutorial',
      details: 'Covers single-needle lockstitch machines. Teaches proper foot pedal pressure control, safety finger guards, and troubleshooting bobbin thread bunching.',
      actionLabel: 'Watch / Learn'
    },
    {
      id: 'vid-3',
      category: 'videos',
      type: 'Video Tutorial',
      title: 'Basic Electrical Multimeter Testing & Circuit Diagnostics',
      source: 'NSDC Electrical Skills Series',
      skill: 'Electrical Repair',
      skillGroup: 'electrical',
      description: 'Learn voltage testing, continuity checking, and safe fault diagnosis for domestic appliances, solar charge controllers, and battery banks.',
      badge: 'Technical Video',
      details: 'Demonstrates safe handling of digital multimeters, measuring AC/DC voltage, testing resistance, and identifying blown fuses in village micro-grids.',
      actionLabel: 'Watch / Learn'
    },
    {
      id: 'vid-4',
      category: 'videos',
      type: 'Business Tutorial',
      title: 'Digital Bookkeeping & UPI Payment Setup for Micro-Shops',
      source: 'PM-AJAY Enterprise Facilitation Cell',
      skill: 'Digital & Retail',
      skillGroup: 'business',
      description: 'Simple mobile-friendly walkthrough on managing daily cash ledgers, accepting QR code payments, and maintaining stock records for small village units.',
      badge: 'Micro-Business Tool',
      details: 'Teaches simple smartphone bookkeeping applications, QR code setup for shops, and separating personal expenses from business cash flow.',
      actionLabel: 'Watch / Learn'
    }
  ];

  // Section D: People & Places to Meet
  const people = [
    {
      id: 'person-1',
      category: 'people',
      type: 'Accredited District Centre',
      title: 'District PM-AJAY Skill Development Hub',
      location: 'Hanamkonda, Warangal',
      focus: 'Industrial Tailoring, Solar Repair & Retail Skills',
      skill: 'Garment Pattern Cutting',
      skillGroup: 'tailoring',
      description: 'Government-accredited training hub equipped with industrial lockstitch machines, pattern cutting tables, and certified PM-AJAY instructors.',
      contact: 'District Skill Officer • Collectorate Compound',
      badge: 'Govt Accredited',
      details: 'Open Monday to Saturday (9:00 AM - 5:00 PM). Beneficiaries can visit directly with Aadhaar and caste certificate to register for upcoming batches.',
      actionLabel: 'View Details & Location'
    },
    {
      id: 'person-2',
      category: 'people',
      type: 'Community SHG Collective',
      title: 'Warangal Mahila Garment & Tailoring SHG Collective',
      location: 'Warangal Rural',
      focus: 'Garment Production, Pattern Cutting & Peer Mentorship',
      skill: 'Sewing Machine Operation',
      skillGroup: 'tailoring',
      description: 'Self-Help Group of 18 experienced women tailors providing peer learning, shared machine access, and bulk order subcontracting for new learners.',
      contact: 'SHG Lead: Smt. Anitha Reddy (Warangal SHG Federation)',
      badge: 'Peer Network',
      details: 'Weekly peer learning circles every Wednesday afternoon. Provides hands-on guidance for beginners learning custom stitching and pattern alteration.',
      actionLabel: 'View Details & Location'
    },
    {
      id: 'person-3',
      category: 'people',
      type: 'Master Trade Artisan',
      title: 'Sri Laxmi Technical & Electrical Repair Workshop',
      location: 'Karimnagar Town',
      focus: 'Electrical Motor Rewinding & Appliance Diagnostics',
      skill: 'Electrical Repair',
      skillGroup: 'electrical',
      description: 'Master electrician providing practical weekend apprenticeships for youth enrolled in district technical skill programs.',
      contact: 'Master Technician: Sri K. Ramesh',
      badge: 'Master Mentor',
      details: 'Offers informal 1-on-1 practical training on motor rewinding, pump repair, and solar battery connection for dedicated trainees.',
      actionLabel: 'View Details & Location'
    },
    {
      id: 'person-4',
      category: 'people',
      type: 'District Facilitation Office',
      title: 'District Livelihood Facilitation Cell (DLFC)',
      location: 'Warangal Collectorate Building',
      focus: 'PM-AJAY Micro-Grants, Subsidies & Placement Support',
      skill: 'Micro-Business & Grants',
      skillGroup: 'business',
      description: 'Official PM-AJAY guidance desk for verifying skill certificates, applying for micro-enterprise capital grants, and tracking post-training placements.',
      contact: 'Livelihood Officer • Room 104, Collectorate',
      badge: 'Official Cell',
      details: 'Official office assisting beneficiaries with capital subsidy paperwork, SHG bank loan facilitation, and certified placement tracking.',
      actionLabel: 'View Details & Location'
    }
  ];

  // Combine all items for global searching/filtering
  const allItems = useMemo(() => {
    return [...announcements, ...stories, ...videos, ...people];
  }, []);

  // Filter items based on activeFilter, selectedCategory, and searchQuery
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      // Filter by section/category
      if (activeFilter !== 'all' && item.category !== activeFilter) {
        return false;
      }
      // Filter by skill group
      if (selectedCategory !== 'all' && item.skillGroup !== selectedCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = (item.description || item.summary || '').toLowerCase().includes(q);
        const matchSkill = (item.skill || '').toLowerCase().includes(q);
        const matchLoc = (item.location || item.source || '').toLowerCase().includes(q);
        const matchType = (item.type || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchSkill && !matchLoc && !matchType) {
          return false;
        }
      }
      return true;
    });
  }, [allItems, activeFilter, selectedCategory, searchQuery]);

  // Section specific items for tabbed / layout view
  const sectionAItems = useMemo(() => filteredItems.filter(i => i.category === 'announcements'), [filteredItems]);
  const sectionBItems = useMemo(() => filteredItems.filter(i => i.category === 'stories'), [filteredItems]);
  const sectionCItems = useMemo(() => filteredItems.filter(i => i.category === 'videos'), [filteredItems]);
  const sectionDItems = useMemo(() => filteredItems.filter(i => i.category === 'people'), [filteredItems]);

  return (
    <div className="community-learning-page" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* HEADER TITLE BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, #FEFCF6 0%, #F5F1EB 100%)',
        border: '1px solid #E1D7C8',
        borderRadius: '16px',
        padding: '28px 24px',
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(79, 55, 40, 0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{
            background: '#CA6603',
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: '700',
            padding: '4px 10px',
            borderRadius: '9999px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            PM-AJAY Livelihood Ecosystem
          </span>
          <span style={{ fontSize: '13px', color: '#6b5240', fontWeight: '500' }}>
            Practical Skills • Mentors • Training Camps
          </span>
        </div>

        <h1 style={{
          fontSize: '28px',
          fontWeight: '800',
          color: '#4F3728',
          margin: '0 0 8px 0',
          lineHeight: '1.2'
        }}>
          Community & Learning
        </h1>
        
        <p style={{
          fontSize: '15px',
          color: '#4F3728',
          opacity: 0.9,
          maxWidth: '820px',
          margin: 0,
          lineHeight: '1.6'
        }}>
          Where to learn, how to learn, and who to connect with. Discover practical skill-building resources, district training camps, local SHG mentors, and success stories mapped directly to your skill gap.
        </p>
      </div>

      {/* PERSONALIZATION BANNER */}
      <div style={{
        background: '#EEE0CC',
        border: '1.5px solid #CA6603',
        borderRadius: '14px',
        padding: '20px 24px',
        marginBottom: '28px',
        boxShadow: '0 4px 12px rgba(202, 102, 3, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#CA6603',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#4F3728', margin: 0 }}>
                Personalized Learning Pathway for Your Skill Profile
              </h2>
              <div style={{ fontSize: '13px', color: '#4F3728', opacity: 0.85, marginTop: '2px' }}>
                Target Occupation: <strong>{userOccupation}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              background: '#FEFCF6',
              border: '1px solid #E1D7C8',
              color: '#4F3728',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <CheckCircle size={14} color="#16a34a" /> Known Skill: {userSkills[0]}
            </span>

            <span style={{
              background: '#FEFCF6',
              border: '1px solid #CA6603',
              color: '#CA6603',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: '800',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <GraduationCap size={14} color="#CA6603" /> Priority Skill Gap: {primarySkillGap}
            </span>
          </div>
        </div>

        {/* WHY THIS MATTERS FLOW STEPPER */}
        <div style={{
          background: '#FEFCF6',
          borderRadius: '10px',
          padding: '14px 16px',
          border: '1px solid #E1D7C8',
          marginTop: '4px'
        }}>
          <div style={{ fontSize: '12px', fontWeight: '800', color: '#CA6603', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '8px' }}>
            Why This Matters: Transforming Skill Gaps into Actionable Growth
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            fontSize: '12.5px',
            color: '#4F3728'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#EEE7D9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '11px', color: '#4F3728', flexShrink: 0 }}>1</div>
              <div><strong>Where to Learn:</strong> District Skill Hubs</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#EEE7D9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '11px', color: '#4F3728', flexShrink: 0 }}>2</div>
              <div><strong>How to Learn:</strong> Step-by-Step Videos</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#EEE7D9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '11px', color: '#4F3728', flexShrink: 0 }}>3</div>
              <div><strong>Who to Learn From:</strong> SHG Mentors</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#EEE7D9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '11px', color: '#4F3728', flexShrink: 0 }}>4</div>
              <div><strong>How Others Learned:</strong> Trade Case Studies</div>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTER CONTROLS */}
      <div style={{
        background: '#F5F1EB',
        border: '1px solid #E1D7C8',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* TOP ROW: SEARCH BOX & SKILL DROPDOWN */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b5240' }} />
            <input
              type="text"
              placeholder="Search skills, stories, videos, training drives, places..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 42px',
                borderRadius: '8px',
                border: '1.5px solid #E1D7C8',
                background: '#FFFFFF',
                fontSize: '14px',
                color: '#4F3728',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b5240'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div style={{ minWidth: '200px' }}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1.5px solid #E1D7C8',
                background: '#FFFFFF',
                fontSize: '13.5px',
                fontWeight: '600',
                color: '#4F3728',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">Filter by Skill Sector: All</option>
              <option value="tailoring">Tailoring & Industrial Garments</option>
              <option value="electrical">Solar & Electrical Repair</option>
              <option value="business">Micro-Enterprise & Retail</option>
            </select>
          </div>
        </div>

        {/* BOTTOM ROW: CATEGORY FILTER TABS */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#4F3728', marginRight: '4px' }}>
            Filter Section:
          </span>

          {[
            { id: 'all', label: 'All Content', icon: LayersIcon },
            { id: 'announcements', label: 'Announcements & Camps', icon: Calendar },
            { id: 'stories', label: 'Stories & Articles', icon: FileText },
            { id: 'videos', label: 'Videos & Tutorials', icon: Video },
            { id: 'people', label: 'People & Places', icon: Building2 }
          ].map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: isActive ? '1.5px solid #CA6603' : '1px solid #E1D7C8',
                  background: isActive ? '#CA6603' : '#FEFCF6',
                  color: isActive ? '#FFFFFF' : '#4F3728',
                  fontSize: '13px',
                  fontWeight: isActive ? '700' : '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* EMPTY STATE */}
      {filteredItems.length === 0 && (
        <div style={{
          background: '#FEFCF6',
          border: '1px solid #E1D7C8',
          borderRadius: '12px',
          padding: '48px 24px',
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#EEE7D9',
            color: '#4F3728',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <Search size={24} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#4F3728', margin: '0 0 8px 0' }}>
            No learning resources found
          </h3>
          <p style={{ fontSize: '14px', color: '#6b5240', maxWidth: '480px', margin: '0 auto 20px auto' }}>
            No practical resources or training camps matched your search query or selected filters.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setActiveFilter('all'); setSelectedCategory('all'); }}
            style={{
              background: '#CA6603',
              color: '#FFFFFF',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '13.5px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Clear Search & Filters
          </button>
        </div>
      )}

      {/* SECTION A: OPPORTUNITIES & ANNOUNCEMENTS */}
      {(activeFilter === 'all' || activeFilter === 'announcements') && sectionAItems.length > 0 && (
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#4F3728', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={22} color="#CA6603" /> Section A: Opportunities & Announcements
              </h2>
              <p style={{ fontSize: '13.5px', color: '#6b5240', margin: '4px 0 0 0' }}>
                Skill-development drives, practical training camps, and local livelihood events.
              </p>
            </div>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#CA6603', background: '#EEE0CC', padding: '4px 10px', borderRadius: '6px' }}>
              {sectionAItems.length} Drives Available
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px'
          }}>
            {sectionAItems.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#F5F1EB',
                  border: '1px solid #E1D7C8',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 6px rgba(79, 55, 40, 0.04)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#CA6603', background: '#FEFCF6', border: '1px solid #E1D7C8', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                      {item.type}
                    </span>
                    <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '4px' }}>
                      {item.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#4F3728', margin: '0 0 8px 0', lineHeight: '1.3' }}>
                    {item.title}
                  </h3>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12.5px', color: '#6b5240', marginBottom: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} color="#CA6603" /> {item.location}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {item.date}</span>
                  </div>

                  <p style={{ fontSize: '13px', color: '#4F3728', opacity: 0.9, lineHeight: '1.5', margin: '0 0 16px 0' }}>
                    {item.description}
                  </p>
                </div>

                <button
                  onClick={() => setModalItem(item)}
                  style={{
                    width: '100%',
                    background: '#FEFCF6',
                    border: '1.5px solid #CA6603',
                    color: '#CA6603',
                    padding: '9px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {item.actionLabel} <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION B: STORIES & ARTICLES */}
      {(activeFilter === 'all' || activeFilter === 'stories') && sectionBItems.length > 0 && (
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#4F3728', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={22} color="#CA6603" /> Section B: Stories & Educational Articles
              </h2>
              <p style={{ fontSize: '13.5px', color: '#6b5240', margin: '4px 0 0 0' }}>
                Trade certification guides, micro-enterprise case studies, and practical tips.
              </p>
            </div>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#CA6603', background: '#EEE0CC', padding: '4px 10px', borderRadius: '6px' }}>
              {sectionBItems.length} Articles
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px'
          }}>
            {sectionBItems.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#F5F1EB',
                  border: '1px solid #E1D7C8',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 6px rgba(79, 55, 40, 0.04)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#4F3728', background: '#EEE7D9', padding: '3px 8px', borderRadius: '4px' }}>
                      {item.type}
                    </span>
                    <span style={{ fontSize: '12px', color: '#6b5240', fontWeight: '600' }}>
                      {item.readingTime}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#4F3728', margin: '0 0 8px 0', lineHeight: '1.3' }}>
                    {item.title}
                  </h3>

                  <p style={{ fontSize: '13px', color: '#4F3728', opacity: 0.9, lineHeight: '1.5', margin: '0 0 16px 0' }}>
                    {item.summary}
                  </p>
                </div>

                <button
                  onClick={() => setModalItem(item)}
                  style={{
                    width: '100%',
                    background: '#CA6603',
                    border: '1px solid #CA6603',
                    color: '#FFFFFF',
                    padding: '9px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {item.actionLabel} <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION C: LEARN THROUGH VIDEOS & RESOURCES */}
      {(activeFilter === 'all' || activeFilter === 'videos') && sectionCItems.length > 0 && (
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#4F3728', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Video size={22} color="#CA6603" /> Section C: Learn Through Videos & Resources
              </h2>
              <p style={{ fontSize: '13.5px', color: '#6b5240', margin: '4px 0 0 0' }}>
                Practical video walkthroughs, equipment operation guides, and skill tutorials.
              </p>
            </div>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#CA6603', background: '#EEE0CC', padding: '4px 10px', borderRadius: '6px' }}>
              {sectionCItems.length} Videos
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px'
          }}>
            {sectionCItems.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#F5F1EB',
                  border: '1px solid #E1D7C8',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 6px rgba(79, 55, 40, 0.04)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#CA6603', background: '#FEFCF6', border: '1px solid #E1D7C8', padding: '3px 8px', borderRadius: '4px' }}>
                      {item.type}
                    </span>
                    <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#1d4ed8', background: '#dbeafe', padding: '2px 8px', borderRadius: '4px' }}>
                      {item.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#4F3728', margin: '0 0 6px 0', lineHeight: '1.3' }}>
                    {item.title}
                  </h3>

                  <div style={{ fontSize: '12px', color: '#6b5240', fontWeight: '600', marginBottom: '10px' }}>
                    Source: {item.source}
                  </div>

                  <p style={{ fontSize: '13px', color: '#4F3728', opacity: 0.9, lineHeight: '1.5', margin: '0 0 16px 0' }}>
                    {item.description}
                  </p>
                </div>

                <button
                  onClick={() => setModalItem(item)}
                  style={{
                    width: '100%',
                    background: '#FEFCF6',
                    border: '1.5px solid #CA6603',
                    color: '#CA6603',
                    padding: '9px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Video size={15} /> {item.actionLabel}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION D: PEOPLE & PLACES TO MEET */}
      {(activeFilter === 'all' || activeFilter === 'people') && sectionDItems.length > 0 && (
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#4F3728', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={22} color="#CA6603" /> Section D: People & Places to Meet
              </h2>
              <p style={{ fontSize: '13.5px', color: '#6b5240', margin: '4px 0 0 0' }}>
                Accredited district training centers, SHG mentorship collectives, and local workshops.
              </p>
            </div>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#CA6603', background: '#EEE0CC', padding: '4px 10px', borderRadius: '6px' }}>
              {sectionDItems.length} Contacts & Centers
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px'
          }}>
            {sectionDItems.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#F5F1EB',
                  border: '1px solid #E1D7C8',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 6px rgba(79, 55, 40, 0.04)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#4F3728', background: '#EEE7D9', padding: '3px 8px', borderRadius: '4px' }}>
                      {item.type}
                    </span>
                    <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#ca6603', background: '#fef3c7', padding: '2px 8px', borderRadius: '4px' }}>
                      {item.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#4F3728', margin: '0 0 6px 0', lineHeight: '1.3' }}>
                    {item.title}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', color: '#6b5240', marginBottom: '10px' }}>
                    <MapPin size={14} color="#CA6603" /> {item.location}
                  </div>

                  <p style={{ fontSize: '13px', color: '#4F3728', opacity: 0.9, lineHeight: '1.5', margin: '0 0 16px 0' }}>
                    {item.description}
                  </p>
                </div>

                <button
                  onClick={() => setModalItem(item)}
                  style={{
                    width: '100%',
                    background: '#CA6603',
                    border: '1px solid #CA6603',
                    color: '#FFFFFF',
                    padding: '9px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {item.actionLabel} <ChevronRight size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {modalItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(3px)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#FEFCF6',
            border: '1.5px solid #E1D7C8',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setModalItem(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#F5F1EB',
                border: '1px solid #E1D7C8',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#4F3728'
              }}
            >
              <X size={18} />
            </button>

            <span style={{ fontSize: '11px', fontWeight: '800', color: '#CA6603', background: '#EEE0CC', padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase' }}>
              {modalItem.type}
            </span>

            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#4F3728', margin: '12px 0 8px 0' }}>
              {modalItem.title}
            </h2>

            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#6b5240', marginBottom: '16px', flexWrap: 'wrap' }}>
              {modalItem.location && <span>📍 {modalItem.location}</span>}
              {modalItem.date && <span>📅 {modalItem.date}</span>}
              {modalItem.source && <span>🎓 {modalItem.source}</span>}
              {modalItem.contact && <span>☎️ {modalItem.contact}</span>}
            </div>

            <div style={{ background: '#F5F1EB', padding: '16px', borderRadius: '10px', border: '1px solid #E1D7C8', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#CA6603', textTransform: 'uppercase', marginBottom: '6px' }}>
                Resource Details & Guidelines
              </div>
              <p style={{ fontSize: '14px', color: '#4F3728', lineHeight: '1.6', margin: 0 }}>
                {modalItem.details || modalItem.description || modalItem.summary}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                onClick={() => setModalItem(null)}
                style={{
                  background: '#F5F1EB',
                  border: '1px solid #E1D7C8',
                  color: '#4F3728',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontSize: '13.5px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>

              <Link
                to="/roadmap"
                style={{
                  background: '#CA6603',
                  color: '#FFFFFF',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontSize: '13.5px',
                  fontWeight: '700',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                View in Career Roadmap <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function LayersIcon(props) {
  return <Briefcase {...props} />;
}
