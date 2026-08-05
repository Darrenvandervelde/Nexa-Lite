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

# ---------- Minimal Dark Theme ----------
st.markdown("""
<style>
    .stApp {
        background-color: #0f172a;
        color: #e2e8f0;
    }
    h1, h2, h3 {
        color: #f1f5f9 !important;
    }
    [data-testid="stSidebar"] {
        background-color: #1e293b;
        border-right: 1px solid #334155;
    }
    .stChatMessage {
        background-color: transparent;
    }
    [data-testid="stChatMessageContent"] {
        background-color: #1e293b;
        border-radius: 12px;
        padding: 12px 16px;
        border: 1px solid #334155;
    }
    .stCodeBlock {
        background-color: #0f172a !important;
        border-radius: 8px;
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
    st.title("AURA")
    st.caption("Code Companion")
    
    st.divider()
    
    api_key = st.text_input(
        "OpenRouter API Key",
        type="password",
        value=os.getenv("OPENROUTER_API_KEY", ""),
        placeholder="sk-or-v1-..."
    )
    
    model_name = st.selectbox("Model", list(MODELS.keys()), index=0)
    model_id = MODELS[model_name]
    
    st.divider()
    
    if st.button("Clear Chat", use_container_width=True):
        st.session_state.messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        st.rerun()
    
    st.caption("Powered by OpenRouter")

# ---------- Main Chat ----------
st.title("AURA // Code Companion")
st.caption("Your AI pair-programmer")

# Display chat history
for msg in st.session_state.messages:
    if msg["role"] == "system":
        continue
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# Chat input
if prompt := st.chat_input("Ask AURA anything about code..."):
    if not api_key:
        st.error("Please enter your OpenRouter API key in the sidebar.")
        st.stop()

    # Add user message
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # Generate response
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
                    placeholder.markdown(full_response + "▌")

            placeholder.markdown(full_response)
            st.session_state.messages.append({"role": "assistant", "content": full_response})

        except Exception as e:
            st.error(f"Error: {e}")