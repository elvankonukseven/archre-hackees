# AI-Powered Writeups for Next-Gen Underwriting

## Overview

This project was built during the **Arch Re Hackathon** to support underwriters in streamlining the creation of reinsurance writeups. It combines document analysis, macroeconomic context, and industry data into a single assistant designed to reduce manual effort and improve underwriting quality.

## Problem Statement

Underwriting reinsurance contracts involves:

- Reviewing contractual/legal clause changes year-over-year  
- Comparing cedant-submitted data with internal or industry models  
- Assessing macroeconomic and regulatory shifts that impact risk  
- Profiling the cedant's historical performance  
- Producing clear, well-structured underwriting reports

This process is data-heavy and time-consuming, often relying on fragmented tools and manual effort.

## Our Solution

We created an AI-powered underwriting copilot that:

- Dynamically ingests documents (contracts, submissions, reports)  
- Uses semantic chunking and RAG (retrieval-augmented generation) to ground responses  
- Supports a chat interface for interactive exploration  
- Automatically generates full UW writeups  
- Includes voice input support for more natural interactions

## Core Features

- **Document ingestion**: Upload files and automatically embed their contents  
- **Chat interface**: Ask underwriting-specific questions with contextual answers  
- **Writeup generation**: Automatically draft underwriting reports  
- **Voice input**: Use Whisper for audio-based queries  
- **Expandable architecture**: Designed to handle multiple formats and data sources

## Tech Stack

- **Frontend**: React  
- **Backend**: Python  
- **AI & Retrieval**: LangChain, OpenAI (GPT-4, Embeddings), FAISS  
- **Voice Input**: OpenAI Whisper  
- **File Support**: PDF, MD, XLSX, CSV, plain text, mp3

## Example Use Cases

- “Highlight key contractual clause changes YoY in contract X.”  
- “Do historic losses from cedant Y align with industry data?”  
- “What macroeconomic factors could impact contract X renewal?”  
- “Generate an underwriting report for the Turkey flood submission.”  

## Data Sources Used

- Reinsurance submissions  
- Contract documents (current and previous year)  
- Historical claims data  
- Macroeconomic data (forex, inflation, interest rates)  
- News articles (2022–2025)


## Contributors
 
- [Ines Bouchama]
- [Elvan Konukseven]  
- [Flavia Wallenhorst]

