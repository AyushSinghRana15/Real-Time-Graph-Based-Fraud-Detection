import streamlit as st
import pandas as pd
import pickle
import matplotlib.pyplot as plt
import networkx as nx

# -----------------------------
# LOAD MODEL (FIXED PATH)
# -----------------------------
model = pickle.load(open("model.pkl", "rb"))
columns = pickle.load(open("columns.pkl", "rb"))

# -----------------------------
# 🔥 PERSISTENT GRAPH
# -----------------------------
if "graph" not in st.session_state:
    st.session_state.graph = nx.DiGraph()

G = st.session_state.graph

# -----------------------------
# RESET BUTTON
# -----------------------------
if st.sidebar.button("Reset Graph"):
    st.session_state.graph = nx.DiGraph()
    G = st.session_state.graph
    st.success("Graph Reset Successfully!")

# -----------------------------
# GRAPH FUNCTIONS
# -----------------------------
def update_graph(sender, receiver):
    G.add_edge(sender, receiver)

def get_graph_features(sender):
    degree = G.out_degree(sender)
    try:
        clustering = nx.clustering(G.to_undirected(), sender)
    except:
        clustering = 0
    return degree, clustering

def detect_cycle(G):
    try:
        return list(nx.simple_cycles(G))
    except:
        return []

# -----------------------------
# PREPROCESS
# -----------------------------
def preprocess(input_dict):
    df = pd.DataFrame([input_dict])

    df['orig_diff'] = df['oldbalanceOrg'] - df['newbalanceOrig']
    df['dest_diff'] = df['newbalanceDest'] - df['oldbalanceDest']

    df['orig_zero'] = (df['oldbalanceOrg'] == 0).astype(int)
    df['dest_zero'] = (df['oldbalanceDest'] == 0).astype(int)

    df['isHighRiskType'] = df['type'].isin(['CASH_OUT', 'TRANSFER']).astype(int)

    df = pd.get_dummies(df, columns=['type'], drop_first=True)
    df = df.reindex(columns=columns, fill_value=0)

    return df

# -----------------------------
# UI
# -----------------------------
st.title(" AI Fraud Detection with Graph Intelligence 🔥")

st.markdown("""
✔️ Manual Transaction Flow  
✔️ Graph Network Tracking  
✔️ Cycle Detection (Fraud Rings)   
""")

st.sidebar.header("Enter Transaction Details")

# 🔥 MANUAL FLOW INPUT
sender_id = st.sidebar.number_input("Sender ID", min_value=0)
receiver_id = st.sidebar.number_input("Receiver ID", min_value=0)

step = st.sidebar.number_input("Step", min_value=0)

type_ = st.sidebar.selectbox("Transaction Type",
                            ["CASH_OUT", "TRANSFER", "PAYMENT", "CASH_IN", "DEBIT"])

amount = st.sidebar.number_input("Amount", min_value=0.0)
oldbalanceOrg = st.sidebar.number_input("Old Balance Orig", min_value=0.0)
newbalanceOrig = st.sidebar.number_input("New Balance Orig", min_value=0.0)
oldbalanceDest = st.sidebar.number_input("Old Balance Dest", min_value=0.0)
newbalanceDest = st.sidebar.number_input("New Balance Dest", min_value=0.0)

sender = f"user_{sender_id}"
receiver = f"user_{receiver_id}"

# -----------------------------
# PREDICT
# -----------------------------
if st.sidebar.button("Predict"):

    if sender == receiver:
        st.warning("Sender and Receiver cannot be same!")
    else:
        # Update graph
        update_graph(sender, receiver)

        # Show flow
        st.write(f" Transaction Flow: {sender} → {receiver}")

        # Debug edges
        st.write(" Current Edges:", list(G.edges()))

        # Graph features
        degree, clustering = get_graph_features(sender)

        # Cycle detection
        cycles = detect_cycle(G)
        cycle_flag = 1 if len(cycles) > 0 else 0

        # Input
        input_dict = {
            'step': step,
            'type': type_,
            'amount': amount,
            'oldbalanceOrg': oldbalanceOrg,
            'newbalanceOrig': newbalanceOrig,
            'oldbalanceDest': oldbalanceDest,
            'newbalanceDest': newbalanceDest
        }

        final_input = preprocess(input_dict)

        # ML prediction
        prob = model.predict_proba(final_input)[0][1]

        # 🔥 HYBRID LOGIC
        if degree > 3:
            prob += 0.05
        if clustering > 0.4:
            prob += 0.1
        if cycle_flag:
            prob += 0.3

        # Final decision
        threshold = 0.7
        result = "🚨 Fraud Detected!" if prob > threshold else "✅ Safe Transaction"

        # ---------------- OUTPUT ----------------
        st.subheader(" Prediction Result")

        if prob > threshold:
            st.error(result)
        else:
            st.success(result)

        st.write(f"💡 Probability: {prob:.4f}")
        st.write(f"🔗 Degree: {degree}")
        st.write(f"🔄 Clustering: {clustering:.2f}")
        st.write(f"🔁 Cycle Detected: {cycle_flag}")

        if cycle_flag:
            st.error("🔄 Fraud Cycle Detected!")

        # 📊 Probability Graph
        st.subheader("📊 Fraud Probability")
        fig1, ax1 = plt.subplots()
        ax1.bar(['Safe', 'Fraud'], [1 - prob, prob])
        st.pyplot(fig1)

        # 🌐 Graph Visualization (with arrows)
        st.subheader("🌐 Transaction Network")

        fig2, ax2 = plt.subplots(figsize=(6,6))

        pos = nx.spring_layout(G, seed=42)

        nx.draw(
            G,
            pos,
            with_labels=True,
            node_color="lightblue",
            node_size=800,
            arrows=True,
            arrowsize=20,
            width=2,
            ax=ax2
        )

        st.pyplot(fig2)

        # Show cycles
        if cycle_flag:
            st.subheader("🔄 Detected Cycles")
            st.write(cycles)