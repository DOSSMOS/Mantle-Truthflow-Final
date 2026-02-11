// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ChallengeArena
 * @dev Red-Blue challenge system for prediction markets on HashKey Chain
 * @notice Users submit challenges (red/attack) or defenses (blue/defend) with evidence
 *         All data stored on-chain, users pay their own gas
 */
contract ChallengeArena {

    enum ChallengeType { Red, Blue }

    struct Challenge {
        uint256 id;
        uint256 marketId;
        ChallengeType cType;
        address author;
        string title;
        string evidence;
        uint256 timestamp;
        uint256 replyToId;   // 0 = top-level, >0 = reply to another challenge
    }

    // challengeId => Challenge
    mapping(uint256 => Challenge) public challenges;
    // marketId => array of challengeIds
    mapping(uint256 => uint256[]) public marketChallenges;

    uint256 public challengeCount;

    // Events
    event ChallengeSubmitted(
        uint256 indexed challengeId,
        uint256 indexed marketId,
        ChallengeType cType,
        address indexed author,
        string title,
        uint256 replyToId
    );

    /**
     * @dev Submit a new challenge or defense
     * @param _marketId  The prediction market ID this challenge belongs to
     * @param _isRed     true = Red (attack), false = Blue (defend)
     * @param _title     Short title
     * @param _evidence  Evidence / PoC text
     * @param _replyToId 0 for top-level, or the challengeId being replied to
     */
    function submitChallenge(
        uint256 _marketId,
        bool _isRed,
        string calldata _title,
        string calldata _evidence,
        uint256 _replyToId
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title required");
        require(bytes(_evidence).length > 0, "Evidence required");
        if (_replyToId > 0) {
            require(_replyToId <= challengeCount, "Invalid replyToId");
        }

        challengeCount++;
        uint256 cId = challengeCount;

        challenges[cId] = Challenge({
            id: cId,
            marketId: _marketId,
            cType: _isRed ? ChallengeType.Red : ChallengeType.Blue,
            author: msg.sender,
            title: _title,
            evidence: _evidence,
            timestamp: block.timestamp,
            replyToId: _replyToId
        });

        marketChallenges[_marketId].push(cId);

        emit ChallengeSubmitted(cId, _marketId, _isRed ? ChallengeType.Red : ChallengeType.Blue, msg.sender, _title, _replyToId);
        return cId;
    }

    /**
     * @dev Get total number of challenges for a market
     */
    function getMarketChallengeCount(uint256 _marketId) external view returns (uint256) {
        return marketChallenges[_marketId].length;
    }

    /**
     * @dev Get a page of challenge IDs for a market
     * @param _marketId Market ID
     * @param _offset   Start index
     * @param _limit    Max items to return
     */
    function getMarketChallengeIds(
        uint256 _marketId,
        uint256 _offset,
        uint256 _limit
    ) external view returns (uint256[] memory) {
        uint256[] storage ids = marketChallenges[_marketId];
        uint256 len = ids.length;
        if (_offset >= len) {
            return new uint256[](0);
        }
        uint256 end = _offset + _limit;
        if (end > len) end = len;
        uint256 size = end - _offset;
        uint256[] memory result = new uint256[](size);
        for (uint256 i = 0; i < size; i++) {
            result[i] = ids[_offset + i];
        }
        return result;
    }

    /**
     * @dev Get full challenge data by ID
     */
    function getChallenge(uint256 _challengeId) external view returns (
        uint256 id,
        uint256 marketId,
        ChallengeType cType,
        address author,
        string memory title,
        string memory evidence,
        uint256 timestamp,
        uint256 replyToId
    ) {
        Challenge storage c = challenges[_challengeId];
        return (c.id, c.marketId, c.cType, c.author, c.title, c.evidence, c.timestamp, c.replyToId);
    }
}
