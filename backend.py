import streamlit as st
from openai import OpenAI
import os

# ---------- Page Config ----------
st.set_page_config(
    page_title="AURA // Code Companion",
    page_icon="◈",
    layout="centered",
    initial_sidebar_state="expanded"
)

# ---------- Futuristic Theme ----------
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;600;700&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap');

/* ===== Global ===== */
.stApp {
    background: radial-gradient(ellipse at top, #0a1628 0%, #020617 70%);
    color: #e0f2fe;
    font-family: 'Inter', sans-serif;
}

/* Hide default Streamlit chrome */
#MainMenu, footer, header, [data-testid="stToolbar"] {
    visibility: hidden !important;
    height: 0 !important;
}

/* ===== Sidebar ===== */
[data-testid="stSidebar"] {
    background: linear-gradient(180deg, #0f172a 0%, #020617 100%);
    border-right: 1px solid rgba(34, 211, 238, 0.25);
    box-shadow: 4px 0 24px rgba(6, 182, 212, 0.08);
}

[data-testid="stSidebar"] h1 {
    font-family: 'Orbitron', sans-serif !important;
    color: #22d3ee !important;
    letter-spacing: 2px;
    text-shadow: 0 0 12px rgba(34, 211, 238, 0.5);
}

/* ===== Titles ===== */
h1 {
    font-family: 'Orbitron', sans-serif !important;
    background: linear-gradient(90deg, #22d3ee, #67e8f9);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 1px;
}

/* ===== Chat Messages ===== */
.stChatMessage {
    background: transparent !important;
}

[data-testid="stChatMessageContent"] {
    background: rgba(15, 23, 42, 0.75) !important;
    border: 1px solid rgba(34, 211, 238, 0.2) !important;
    border-radius: 16px !important;
    padding: 16px 20px !important;
    box-shadow: 0 0 20px rgba(34, 211, 238, 0.06);
    backdrop-filter: blur(8px);
}

/* Code blocks */
.stCodeBlock, pre {
    background: #020617 !important;
    border: 1px solid rgba(34, 211, 238, 0.15) !important;
    border-radius: 12px !important;
    font-family: 'JetBrains Mono', monospace !important;
}

/* ===== Inputs & Buttons ===== */
.stTextInput > div > div > input,
.stSelectbox > div > div {
    background: rgba(15, 23, 42, 0.8) !important;
    border: 1px solid rgba(34, 211, 238, 0.3) !important;
    border-radius: 10px !important;
    color: #e0f2fe !important;
}

.stTextInput > div > div > input:focus {
    border-color: #22d3ee !important;
    box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.2) !important;
}

.stButton > button {
    background: linear-gradient(90deg, rgba(6, 182, 212, 0.15), rgba(14, 165, 233, 0.1)) !important;
    border: 1px solid rgba(34, 211, 238, 0.4) !important;
    color: #22d3ee !important;
    border-radius: 10px !important;
    font-weight: 500 !important;
    transition: all 0.2s ease !important;
}

.stButton > button:hover {
    background: rgba(34, 211, 238, 0.15) !important;
    border-color: #22d3ee !important;
    box-shadow: 0 0 16px rgba(34, 211, 238, 0.25) !important;
    transform: translateY(-1px);
}

/* Chat input */
.stChatInput textarea {
    background: rgba(15, 23, 42, 0.9) !important;
    border: 1px solid rgba(34, 211, 238, 0.35) !important;
    border-radius: 16px !important;
    color: #e0f2fe !important;
}

.stChatInput textarea:focus {
    border-color: #22d3ee !important;
    box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.15) !important;
}

/* Scrollbar */
::-webkit-scrollbar {
    width: 6px;
}
::-webkit-scrollbar-thumb {
    background: rgba(34, 211, 238, 0.3);
    border-radius: 3px;
}

/* Divider */
hr {
    border-color: rgba(34, 211, 238, 0.15) !important;
}
</style>
""", unsafe_allow_html=True)

# ---------- Models ----------
MODELS = {
    "North Mini Code": "cohere/north-mini-code:free",
    "Laguna S 2.1": "poolside/laguna-s-2.1:free",
    "GPT-OSS 20B": "openai/gpt-oss-20b:free",
    "Nemotron 3 Ultra": "nvidia/nemotron-3-ultra-550b-a55b:free",
    "Free Router": "openrouter/free",
}

SYSTEM_PROMPT = """You are AURA, an elite AI Code Companion and Staff-level Software Engineer.

You write clean, production-grade code with excellent readability and modern best practices.
- Prefer clarity and simplicity
- Handle edge cases and errors properly
- Use meaningful names
- Provide complete, working solutions
- Use correct markdown code blocks with language tags
- After code, briefly explain key decisions when helpful
- Default to Python unless another language is specified

Tone: Precise, professional, collaborative — like a strong senior engineer pair-programming."""

# ---------- Session State ----------
if "messages" not in st.session_state:
    st.session_state.messages = [{"role": "system", "content": SYSTEM_PROMPT}]

# ---------- Sidebar ----------
with st.sidebar:
    st.markdown("## ◈ AURA")
    st.caption("Neural Code Companion")
    
    st.divider()
    
    api_key = st.text_input(
        "API Key",
        type="password",
        value=os.getenv("OPENROUTER_API_KEY", ""),
        placeholder="sk-or-v1-..."
    )
    
    model_name = st.selectbox("Model", list(MODELS.keys()), index=0)
    model_id = MODELS[model_name]
    
    st.divider()
    
    if st.button("↺ Clear Session", use_container_width=True):
        st.session_state.messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        st.rerun()
    
    st.markdown("---")
    st.caption("◈ OpenRouter • Streaming")

# ---------- Main ----------
st.markdown("# AURA // Code Companion")
st.caption("Staff-level AI pair programmer • Real-time inference")

# Chat history
for msg in st.session_state.messages:
    if msg["role"] == "system":
        continue
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# Input
if prompt := st.chat_input("Transmit query to AURA..."):
    if not api_key:
        st.error("◈ Insert OpenRouter API key in the sidebar.")
        st.stop()

    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    with st.chat_message("assistant"):
        placeholder = st.empty()
        full_response = ""

        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
            default_headers={
                "HTTP-Referer": "https://localhost",
                "X-Title": "AURA AI Code Companion",
            },
        )

        try:
            stream = client.chat.completions.create(
                model=model_id,
                messages=st.session_state.messages,
                temperature=0.2,
                max_tokens=4096,
                stream=True,
            )

            for chunk in stream:
                delta = chunk.choices[0].delta.content
                if delta:
                    full_response += delta
                    placeholder.markdown(full_response + " ▌")

            placeholder.markdown(full_response)
            st.session_state.messages.append({"role": "assistant", "content": full_response})

        except Exception as e:
            st.error(f"◈ Transmission error: {e}")
