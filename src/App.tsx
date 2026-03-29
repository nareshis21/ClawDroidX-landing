import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { Bolt, Wrench, Shield, Phone, Accessibility, Activity, Search, RefreshCw, Zap } from 'lucide-react'
import './App.css'

const Reveal = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay, ease: [0.4, 0, 0.2, 1] }}
  >
    {children}
  </motion.div>
)

const Navbar = () => (
  <nav className="navbar">
    <div className="logo">
      <img src="/assets/logo.png" alt="ClawDroidX" />
      <span>ClawDroidX</span>
    </div>
    <ul className="nav-links">
      <li><a href="https://github.com/nareshis21/ClawDroidX" className="btn-nav-download">Download App</a></li>
    </ul>
  </nav>
)

// Load YouTube API script once
let apiScriptAdded = false;
const loadYouTubeAPI = () => {
  if (apiScriptAdded) return;
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
  apiScriptAdded = true;
};

// Global registry for players to unmute on first interaction
const activePlayers = new Set<any>();
if (typeof window !== 'undefined') {
  const unmuteAll = () => {
    activePlayers.forEach(player => {
      try {
        if (player && typeof player.unMute === 'function') {
          player.unMute();
          player.setVolume(100);
        }
      } catch (e) {}
    });
    window.removeEventListener('mousedown', unmuteAll);
    window.removeEventListener('touchstart', unmuteAll);
    window.removeEventListener('scroll', unmuteAll);
    window.removeEventListener('keydown', unmuteAll);
  };
  window.addEventListener('mousedown', unmuteAll);
  window.addEventListener('touchstart', unmuteAll);
  window.addEventListener('scroll', unmuteAll);
  window.addEventListener('keydown', unmuteAll);
}

const Hero = () => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInternalAction = useRef(false);
  const [hasUserPaused, setHasUserPaused] = React.useState(false);
  const iframeId = 'hero-player';

  React.useEffect(() => {
    loadYouTubeAPI();
    
    let timer: any;
    const initPlayer = () => {
      const el = document.getElementById(iframeId);
      if ((window as any).YT && (window as any).YT.Player && el) {
        playerRef.current = new (window as any).YT.Player(iframeId, {
          events: {
            onReady: (event: any) => {
              activePlayers.add(event.target);
              event.target.setVolume(100);
              const rect = containerRef.current?.getBoundingClientRect();
              if (rect && rect.top < window.innerHeight && rect.bottom > 0 && !hasUserPaused) {
                isInternalAction.current = true;
                event.target.playVideo();
                // We REMOVE unMute() here to bypass browser blocks on reload.
                // The global interaction listener will unmute when you touch the screen.
              }
            },
            onStateChange: (event: any) => {
              if (event.data === 2) { // PAUSED
                if (!isInternalAction.current) setHasUserPaused(true);
              } else if (event.data === 1) { // PLAYING
                if (!isInternalAction.current) setHasUserPaused(false);
              }
              isInternalAction.current = false;
            },
          },
        });
        clearInterval(timer);
      }
    };

    timer = setInterval(initPlayer, 200);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!playerRef.current || typeof playerRef.current.playVideo !== 'function') return;
          if (entry.isIntersecting) {
            if (!hasUserPaused) {
              isInternalAction.current = true;
              playerRef.current.playVideo();
              // Once they interact once, unMute is allowed here.
              playerRef.current.unMute();
              playerRef.current.setVolume(100);
            }
          } else {
            isInternalAction.current = true;
            playerRef.current.pauseVideo();
          }
        })
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      clearInterval(timer);
      observer.disconnect();
      if (playerRef.current) activePlayers.delete(playerRef.current);
    };
  }, [hasUserPaused]);

  return (
    <header className="hero" ref={containerRef}>
      <div className="hero-content">
        <Reveal><span className="beta-tag">Public Beta</span></Reveal>
        <Reveal delay={0.1}>
          <h1>Your Android — on <span style={{ whiteSpace: 'nowrap' }}>steroids
            <Bolt className="hero-bolt" size={38} />
          </span></h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p>What if your phone could do things <em>for you</em> — securely and hands-free?
          ClawDroidX is the native agent that navigates apps locally so you don't have to.</p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="hero-btns">
            <a href="#" className="btn-download">Download Beta</a>
            <a href="#setup" className="btn-secondary">Watch it Work</a>
          </div>
        </Reveal>

        <Reveal delay={0.4}>
          <div className="config-card">
            <div className="config-header">
              <Wrench size={18} />
              <span>Agent Configuration</span>
            </div>
            <div className="config-body">
              <p>To enable cloud-powered reasoning, provide your <strong>Groq API Key</strong> or <strong>Cloudflare Credentials</strong> within the app's settings menu.</p>
            </div>
          </div>
        </Reveal>
      </div>
      <Reveal delay={0.3}>
        <div className="featured-video-wrapper">
          <div className="youtube-aspect-ratio">
            <iframe
              id={iframeId}
              src="https://www.youtube.com/embed/s7T-aVMKUnY?autoplay=1&mute=1&loop=1&playlist=s7T-aVMKUnY&enablejsapi=1&playsinline=1&rel=0&controls=0&modestbranding=1"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </Reveal>
    </header>
  )
}

const FeatureRow = ({ subtitle, title, description, extra, video, reversed = false }: any) => {
  const isYouTube = video.includes('youtube.com') || video.includes('youtu.be')
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInternalAction = useRef(false);
  const [hasUserPaused, setHasUserPaused] = React.useState(false);
  const [iframeId] = React.useState(() => `player-${Math.random().toString(36).substr(2, 9)}`);

  React.useEffect(() => {
    if (!isYouTube) return;
    loadYouTubeAPI();

    let timer: any;
    const initPlayer = () => {
      const el = document.getElementById(iframeId);
      if ((window as any).YT && (window as any).YT.Player && el) {
        playerRef.current = new (window as any).YT.Player(iframeId, {
          events: {
            onReady: (event: any) => {
              activePlayers.add(event.target);
              event.target.setVolume(100);
              const rect = containerRef.current?.getBoundingClientRect();
              if (rect && rect.top < window.innerHeight && rect.bottom > 0 && !hasUserPaused) {
                isInternalAction.current = true;
                event.target.playVideo();
                // removal of unMute here fixes the reload autoplay stall
              }
            },
            onStateChange: (event: any) => {
              if (event.data === 2) {
                if (!isInternalAction.current) setHasUserPaused(true);
              } else if (event.data === 1) {
                if (!isInternalAction.current) setHasUserPaused(false);
              }
              isInternalAction.current = false;
            },
          },
        });
        clearInterval(timer);
      }
    };

    timer = setInterval(initPlayer, 200);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!playerRef.current || typeof playerRef.current.playVideo !== 'function') return;
          if (entry.isIntersecting) {
            if (!hasUserPaused) {
              isInternalAction.current = true;
              playerRef.current.playVideo();
              playerRef.current.unMute();
              playerRef.current.setVolume(100);
            }
          } else {
            isInternalAction.current = true;
            playerRef.current.pauseVideo();
          }
        })
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      clearInterval(timer);
      observer.disconnect();
      if (playerRef.current) activePlayers.delete(playerRef.current);
    };
  }, [isYouTube, hasUserPaused, iframeId]);

  return (
    <div className={`feature-row ${reversed ? 'reverse' : ''}`} ref={containerRef}>
      <Reveal>
        <div className="feature-info">
          {subtitle && <h4>{subtitle}</h4>}
          <h3>{title}</h3>
          <p>{description}</p>
          {extra && <p style={{ marginTop: '12px', fontSize: '1rem', opacity: 0.8 }}>{extra}</p>}
        </div>
      </Reveal>
      <Reveal delay={0.2}>
        <div className="feature-video-container">
          {isYouTube ? (
            <div className="youtube-aspect-ratio">
              <iframe
                id={iframeId}
                src={`${video}${video.includes('?') ? '&' : '?'}enablejsapi=1&mute=1&playsinline=1&rel=0&controls=0&modestbranding=1`}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={title}
              />
            </div>
          ) : video.endsWith('.mp4') ? (
            <video autoPlay loop muted playsInline>
              <source src={`/assets/${video}`} type="video/mp4" />
            </video>
          ) : (
            <img src={`/assets/${video}`} alt={title} style={{ width: '100%', height: 'auto' }} />
          )}
        </div>
      </Reveal>
    </div>
  )
}

const BenefitCard = ({ icon: Icon, title, description }: any) => (
  <Reveal>
    <div className="pill-card">
      <div className="benefit-icon">
        <Icon size={32} />
      </div>
      <div>
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </div>
  </Reveal>
)

const TechCard = ({ icon: Icon, title, description }: any) => (
  <Reveal>
    <div className="tech-card">
      <div className="tech-icon" style={{ marginBottom: '24px' }}>
        <Icon size={32} color="var(--accent-blue)" />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  </Reveal>
)

const SetupCard = ({ icon: Icon, step, title, description }: any) => (
  <Reveal>
    <div className="setup-card">
      <div className="setup-icon">
        <Icon size={32} />
      </div>
      <h4>{step}. {title}</h4>
      <p>{description}</p>
    </div>
  </Reveal>
)

const RoadmapItem = ({ status, title, description }: any) => (
  <Reveal>
    <div className="roadmap-item">
      <div className="roadmap-status">{status}</div>
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  </Reveal>
)

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <Hero />

      <section className="info-section">
        <div className="section-header centered">
          <h2>How it Works</h2>
          <p>Native orchestration, executed entirely on-device.</p>
        </div>
        <div className="showcase-rows">
          <FeatureRow 
            title="Define Your Goal"
            description="Tell ClawDroidX what you want to achieve. Whether it's ordering groceries or adjusting system settings, our agent understands your intent directly."
            video="https://www.youtube.com/embed/jSZNNOKALu8?enablejsapi=1&playsinline=1&rel=0"
          />
          <FeatureRow 
            title="Autonomous Planning"
            description="The agent builds a native execution plan, identifying the most efficient path through your applications without ever sending UI data to the cloud."
            video="architecture.png"
            reversed
          />
          <FeatureRow 
            title="Local Execution"
            description="Watch as the workflow completes. In this beta phase, we're optimizing for 100% on-device execution to ensure your privacy is never compromised."
            video="https://www.youtube.com/embed/RJsp1HzMuFo?enablejsapi=1&playsinline=1&rel=0"
          />
        </div>
      </section>

      <section className="info-section">
        <div className="section-header centered">
          <h2>Why ClawDroidX?</h2>
          <p>The first truly native, secure AI agent for mobile.</p>
        </div>
        <div className="benefits-grid">
          <BenefitCard icon={Accessibility} title="Fully Native" description="Operates directly on Android accessibility. No ADB or external setups required." />
          <BenefitCard icon={Shield} title="Privacy First" description="Sensitive data like PINs never leaves your device. Secure local UI pruning." />
          <BenefitCard icon={Activity} title="90% Hands-Free" description="Built-in TTS + STT lets you talk to your phone and watch it execute complex tasks." />
        </div>
      </section>

      <section className="info-section">
        <div className="section-header centered">
          <h2>Under the Hood</h2>
          <p>Advanced engineering for the next generation of agents.</p>
        </div>
        <div className="tech-grid">
          <TechCard icon={RefreshCw} title="Zero-Token Replay" description="Learns from success. Repeated tasks are replayed via a local macro cache, eliminating LLM latency and costs." />
          <TechCard icon={Search} title="Semantic Pruning" description="Scans 300+ UI nodes locally using ONNX Runtime, distilling the tree into the top 30 most relevant targets." />
          <TechCard icon={Shield} title="Local Security Vault" description="Sensitive data like PINs and biometric triggers are handled entirely within the device's secure enclave." />
        </div>
      </section>

      <section id="setup" className="info-section">
        <div className="section-header centered">
          <h2>Ready for Launch</h2>
          <p>ClawDroidX requires specific Android permissions to orchestrate your device natively.</p>
        </div>
        <div className="setup-grid">
          <SetupCard step={1} icon={Accessibility} title="Accessibility Service" description="The core engine. Enable this to allow the agent to read screen content and perform clicks/gestures." />
          <SetupCard step={2} icon={Phone} title="BT & Call Management" description="Grants the agent power to manage peripheral connections and automate communication workflows." />
          <SetupCard step={3} icon={Zap} title="Battery: No Restriction" description="Disable Battery Optimization to prevent Android from killing the background engine during tasks." />
          <SetupCard step={4} icon={Wrench} title="Modify System Settings" description="Allows the agent to adjust Brightness, Volume, and other hardware toggles directly." />
        </div>
      </section>

      <section className="info-section">
        <div className="section-header centered">
          <h2>Experience the Magic</h2>
          <p>ClawDroidX turns your mobile intent into autonomous action.</p>
        </div>
        <div className="showcase-rows" style={{ marginTop: '80px' }}>
          <FeatureRow 
            subtitle="Seamless Orchestration"
            title="Uber Ride Discovery"
            description="Experience how ClawDroidX handles complex, multi-step tasks across apps. From setting destinations to choosing ride types, everything is automated natively."
            extra="The agent understands the visual context of the Uber app, navigating through dynamic maps just like a human would."
            video="https://www.youtube.com/embed/o6_O_Dxsg20?enablejsapi=1&playsinline=1&rel=0"
          />
          <FeatureRow 
            subtitle="Local Security Automation"
            title="PinLocal Security Bypass"
            description="Witness the power of local heuristics. ClawDroidX identifies secure PIN entry screens and automates the unlock flow with zero LLM latency, keeping your sensitive data entirely on-device."
            extra="By combining computer vision with direct physical input simulation, we achieve 100% reliability even on high-security payment screens."
            video="https://www.youtube.com/embed/1Iz3m3eLxAI?enablejsapi=1&playsinline=1&rel=0"
            reversed
          />
          <FeatureRow 
            subtitle="Direct OS Orchestration"
            title="Perceptual Hardware Control"
            description="Instant management of Brightness, Volume, and System Toggles. No menus to navigate — our agent understands perceptual power laws to adjust your environment perfectly based on natural intent."
            extra="By leveraging native Android system hooks, ClawDroidX can bypass deep menu nesting, allowing you to control your device's physical state using simple, conversational commands."
            video="https://www.youtube.com/embed/Sem0eNZrkrE?enablejsapi=1&playsinline=1&rel=0"
          />
          <FeatureRow 
            subtitle="Hardware Mastering"
            title="Native Flashlight"
            description="Demonstrating zero-latency execution. Physical hardware toggles happen instantly when you define your goal."
            extra="This showcase highlights the deep integration with Android's hardware abstraction layer, proving that the agent is more than just a UI automation tool."
            video="https://www.youtube.com/embed/L9vyT6JCS_Y?enablejsapi=1&playsinline=1&rel=0"
            reversed
          />
        </div>
      </section>

      <section className="info-section">
        <div className="section-header centered">
          <h2>The Self-Evolving Future</h2>
          <p>Establishing the foundation for collective agent intelligence.</p>
        </div>
        <div className="roadmap-container">
          <RoadmapItem status="Current Phase" title="Local Semantic Pruning" description="Powered by local ONNX embedding models, we currently distill massive UI trees with zero data leakage." />
          <RoadmapItem status="Coming Soon" title="On-Device LLM Planning" description="Transitioning to native LLM routing and execution, removing 100% of external dependencies." />
          <RoadmapItem status="Vision" title="Collective Evolution" description="Building a shared 'skill brain' where every successful task makes every connected agent smarter." />
        </div>
      </section>

      <section className="info-section">
        <div className="section-header centered">
          <h2>Join the Journey</h2>
          <p>We're building this in the open. Use it, break it, and let us know how we can make it better.</p>
          <div className="hero-btns" style={{ marginTop: '32px', justifyContent: 'center' }}>
            <a href="mailto:nareshlahajal@gmail.com" className="btn-download">Email Review</a>
            <a href="https://www.linkedin.com/in/naresh-kumar-lahajal-a50383252/" className="btn-secondary">Message on LinkedIn</a>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-top">
          <div className="footer-info">
            <div className="logo">
              <img src="/assets/logo.png" alt="ClawDroidX" />
              <span>ClawDroidX</span>
            </div>
            <p>Establishing the foundation for native mobile agent orchestration.</p>
          </div>
          <div className="footer-links">
            <div className="link-group">
              <h5>Connect</h5>
              <ul>
                <li><a href="mailto:nareshlahajal@gmail.com">Email Us</a></li>
                <li><a href="https://www.linkedin.com/in/naresh-kumar-lahajal-a50383252/">LinkedIn</a></li>
                <li><a href="https://github.com/nareshis21/ClawDroidX">GitHub</a></li>
              </ul>
            </div>
            <div className="link-group">
              <h5>Get Started</h5>
              <ul>
                <li><a href="https://github.com/nareshis21/ClawDroidX">Download Beta</a></li>
                <li><a href="#">Documentation</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div style={{ marginTop: '80px', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
          <p>&copy; 2026 ClawDroidX. Built for native Android intelligence.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
