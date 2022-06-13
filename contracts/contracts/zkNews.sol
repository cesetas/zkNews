//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@appliedzkp/semaphore-contracts/interfaces/IVerifier.sol";
import "@appliedzkp/semaphore-contracts/base/SemaphoreCore.sol";
import "@appliedzkp/semaphore-contracts/base/SemaphoreGroups.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";



contract zkNews is SemaphoreCore, SemaphoreGroups, Ownable {


    // The external verifier used to verify Semaphore proofs.
    IVerifier public verifier;
    

    struct Post {
        string postId;
        uint256 likes; 
        uint256 dislikes; 
    }

     uint256[] public identityCommitments;

    mapping(bytes32 => Post) public posts; 


    event NewPost(string postId, bytes32 signal);
    event PostLiked(string postId, uint256 likes);

    constructor(address _verifier) {
        verifier = IVerifier(_verifier);
    }

    function getIdentityCommitments() public view returns (uint256 [] memory) {
        return identityCommitments;
    }

    function getIdentityCommitment(uint256 _index) public view returns (uint256) {
        return identityCommitments[_index];
    }

    function insertIdentityAsClient(uint256 _leaf) public {
       identityCommitments.push(_leaf);
    }


    function postNews(
        string memory postId,
        bytes32 signal,
        uint256 root,
        uint256 nullifierHash,
        uint256 externalNullifier,
        uint256[8] calldata proof
    )
        external
    {
        _verifyProof(
                signal,
                root,
                nullifierHash,
                externalNullifier,
                proof,
                verifier
            );

        bytes32 id = keccak256(abi.encodePacked(postId));
        Post memory post = Post({postId: postId, likes: 0, dislikes: 0});
        posts[id] = post;  

        _saveNullifierHash(nullifierHash);
        emit NewPost(postId, signal);
    }

    function likePost(
        string memory postId,
        bytes32 signal,
        uint256 root,
        uint256 nullifierHash,
        uint256 externalNullifier,
        uint256[8] calldata proof
    )
        external
        returns (string memory, uint256)
    {
        _verifyProof(
                signal,
                root,
                nullifierHash,
                externalNullifier,
                proof,
                verifier
            );

        bytes32 id = keccak256(abi.encodePacked(postId));
        posts[id].likes += 1;
        
        _saveNullifierHash(nullifierHash);

        emit PostLiked(postId, posts[id].likes);
        return (postId,  posts[id].likes);
    }

    function dislikePost(
        string memory postId,
        bytes32 signal,
        uint256 root,
        uint256 nullifierHash,
        uint256 externalNullifier,
        uint256[8] calldata proof
    )
        external
        returns (string memory, uint256)
    {
        _verifyProof(
                signal,
                root,
                nullifierHash,
                externalNullifier,
                proof,
                verifier
            );

        bytes32 id = keccak256(abi.encodePacked(postId));
        posts[id].likes += 1;
        
        _saveNullifierHash(nullifierHash);

        emit PostLiked(postId, posts[id].likes);
        return (postId,  posts[id].likes);
    }
}