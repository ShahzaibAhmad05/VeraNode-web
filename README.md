# Anonymous Campus Rumor System

An anonymous system for posting rumors and having them verified through votes.

## Overview

### Flow

```
Rumor posted -> AI Agent validates -> Shown to users -> user votes are added with their weightage -> Voting locks after a certain timespan -> Rumor is uncovered as a fact / lie -> User points are updated
```

### User Accounts & Anonymity

- The system uses secret keys held by the student. Points for the student are stored against a secret key on the database, rather than being stored directly against the user's university ID. This keeps anonymity

- Each user has their **area of vote**, for example, A student of SEECS voting in a rumor that has the area of voting declared as NBS will have less weightage for their vote

- The rumor's area of vote is decided by the user posting the rumor

### Voting & Points System

- Each vote from a user is counted along with a score that is calculated using the user's existing points and the information that they are within the area of vote for the rumor

- If a rumor turns out to be false, the user posting the rumor gets a huge deduction of their points, and the users who voted incorrectly for the rumor lose some of their points and vice versa

- Users will be given a few initial points at the start. If a user's points go bellow a certain negative number, their account will be blocked and voting will be restricted. Admins will have the option to unblock their accounts but then those students will not be given any initial points, instead, they start from zero

### Preventing Random Posts

- A user can simply just "post anything", for example, if a user posts "A whiteboard is white", which is a fact instead of being a rumor, the post is instantly rejected after being invalidated as a fact, rather than a rumor, by the AI agent. This avoids garbage or repeated posts

- Points attached against the user account are hidden from the user, area of vote is shown with the rumor post. A user is asked to confirm to vote if the post is not within their area of voting

- Decisions about the rumors would not be finalized until a minimum percentage of "within area" students have voted

- The timer till the voting locks for a rumor will be dynamic. That is, it could extend if there is a tie, or if the moderator (AI agent) declares the metrics to be "too ambigious" for a decision. Point to note that the AI agent is not involved in the final decision-making

### AI Involvement as a Moderator

- The final decision for whether the rumor is a lie or a fact, will be taken by the system, without any bias

- An AI agent will be serving as a moderator in the system. It will be given information about the total votes, the total points accumulated, the number of votes within the area of voting, and a mix of these metrics

- This will ensure preventing any statistical anomalies in the final decision

### Immutability for uncovered Rumors

- Once a rumor is finalized, its state (Content, Voting Consensus, and Final Decision) is committed to a Blockchain Ledger. Using Hash-Chaining, each new record references the previous one; any attempt by an admin or database expert to alter a past rumor would break the cryptographic chain

## Problem Statement

Build a system where students can submit anonymous rumors/news about campus events, but here's the twist: there's NO central server or admin who controls truth—instead, other anonymous students must verify or dispute claims through some mechanism YOU design, rumors gain "trust scores" through methods you invent, the system must prevent the same person from voting multiple times WITHOUT collecting identities.

Popular false rumors shouldn't auto-win just because more people believe them, verified facts from last month are mysteriously changing their scores, some users are creating bot accounts to manipulate votes, and there's a weird bug where deleted rumors are still affecting the trust scores of newer related rumors. 

Oh, and you need to prove mathematically that your system can't be gamed by a coordinated group of liars — but you can't centrally control who participates.

Breaking down this problem into multiple sub-problems, we have:

- [Problems that we have to solve]()
- [Problems that "can" occur]()

---

## Problems we have to solve

1. There's NO central server or admin who controls the truth

2. Anonymous students must verify or dispute claims through some mechanism YOU design

3. Rumors gain "trust scores" through methods you invent

4. The system must prevent the same person from voting multiple times WITHOUT collecting identities

5. Popular false rumors shouldn't auto-win just because more people believe them

## Solutions

1. The database is architected such that administrative access to the server does not grant "Write" access to the voting ledger. Because the decision of a rumor is determined by the Reputation-Weighted Consensus of the student body and locked via Hash-Chaining, an admin cannot change a result without causing a cryptographic mismatch that would be visible to all users

2. An account system for the users, where one and only one account is created for each student. Only users with accounts are allowed to vote. Each account receives a cryptographic token when the user votes

3. Students mark the rumor red (if it is fake) or green if it is a fact.

4. Since, each account is getting a token after voting, one account cannot be used to cast multiple votes, and the token that is assigned to the account does not contain any information about what the user voted

4. When a user votes, the system generates a unique hash for that specific rumor. The system stores this hash, and when the user tries to vote again on the same rumor, the hash is checked and if found to be identical, the system rejects it

4. Deterministic Nullifiers: To prevent double-voting without identifying the user, the system generates a unique User-Rumor Nullifier. This is a cryptographic hash of the user’s Secret Key combined with the Rumor ID

```math
Nullifier = Hash(SecretKey + RumorID)
```

The database stores this nullifier to ensure that each unique key can only contribute one vote per rumor. Since the hash is one-way, the system can verify that the same person is trying to vote again, but it cannot reverse the hash to reveal the student's identity.

5. For this, we have to make use of multiple human psychological factors to allow the system to detect popular false rumors, and automatically mark them as false or delete them. We are using blind voting, secret balloting, points system that is hidden from the user themself

---

## Problems that "can" occur

6. Verified facts from last month are mysteriously changing their scores

7. Some users are creating bot accounts to manipulate votes

8. There's a weird bug where deleted rumors are still affecting the trust scores of newer related rumors

9. You need to prove mathematically that your system can't be gamed by a coordinated group of liars — but you cannot centrally control who participates

## Solutions

6. Our system locks the rumor / fact in-place after the voting results have been revealed, using a blockchain, so verified facts from earlier never change their scores

7. Accounts that are being used are the official student accounts for the university, campus. Hence, nobody can create bot accounts and use them to manipulate votes

8. In our system, rumors are not related or linked to each other. Hence, they DO NOT affect each other

9. This system uses various methods and psychological techniques in deciding the final outcome of a rumor. For a group of liars to win, their combined voting power must be greater than the honest students. Specifically for this point, we would like to explain here:

**Why this system cannot be Gamed?**

- Since we are using university IDs, bots cannot enter the system for voting, and liars cannot create new accounts to increase their power. Mathematically, the poll of voters is finite

- If the group coordinate to pass a lie, the final truth (the results) will catch them, causing a deduction in their points

- Since the students within the area of vote have higher weightage in voting, a group of outsiders would need significantly more people to overrule a small group of honest voters that are within the area of voting. Mathematically:

```math
W(vote) = P(user) x A(factor) + B(base)
```

P : The current points for the user
A : Proximity multiplier (e.g. 1.5 for inside area, 0.5 for outside)
B : A tiny base value to ensure even new users have something to say

- The system is self-correcting, because every vote relies on "reputation stake", hence, honest users naturally gain more influence over time while the influence of liars mathematically evaporates

## Removing psychological factors from voting

To ensure the system remains objective and isn't swayed by peer pressure effects, we have implemented the following:

- **Blind Voting**: Users cannot see the current vote count or the "trending" status of a rumor while they are casting their own vote. This prevents the "majority opinion" from influencing an individual's decision.

- **Hidden Reputation**: A user’s total points are hidden from others. This ensures that no single user is seen as an "authority" whose vote others should blindly follow.

- **Neutral AI Filtering**: Before a rumor even reaches the public feed, the AI agent filters out emotionally charged or biased language to ensure the post is a clear statement that can be verified, rather than an attempt to incite a specific reaction.

- **Area Isolation**: By emphasizing the Area of Vote, we prioritize proximity and first-hand knowledge over social popularity. A rumor might be popular across the whole campus, but if the local experts (those in the specific department) vote against it, their factual proximity outweighs the general noise.


## Role of Admins

- The system can operate correctly with it's fairness increasing over time, without the need for maintainance or admin involvement

- Admins are only needed if the system administrator wants blocked users to be unblocked if they make a request for it, or pay some fine or do a public apology

- Points or system decisions are internal and not controlled or influenced in any way by the admins
