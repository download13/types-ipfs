import type { EventEmitter } from 'events'
import type CID from 'cids'

export default class IPFS extends EventEmitter {
    types: Types

    static create(options?: Options): Promise<IPFS>

    add(data: FileContent | FileObject, options?: AddOptions): Promise<UnixFSEntry>
    addAll(source: FileStream, options?: any): AsyncIterable<UnixFSEntry>

    cat(ipfsPath: string | CID, options?: {
        offset?: number
        length?: number
        timeout?: number
        signal?: AbortSignal
    }): AsyncIterable<Buffer>

    get(ipfsPath: string | CID, options?: {
        timeout?: number
        signal?: AbortSignal
    }): AsyncIterable<{
        path: string
        content: AsyncIterable<Uint8Array>
        mode: number
        mtime: { secs: number, nsecs: number }
    }>

    ls(ipfsPath: string | CID): AsyncIterable<IPFSFileInfo>

    repo: RepoAPI;
    bootstrap: any;
    config: any;
    block: any;
    object: ObjectAPI;
    dag: DagAPI;
    libp2p: any;
    swarm: SwarmAPI;
    files: FilesAPI;
    bitswap: any;
    pubsub: any;
    dht: any;

    pin: {
        add(ipfsPath: string | CID, options?: any): unknown
        rm(ipfsPath: string | CID, options?: any): unknown
    }
}


interface Options {
    init?: boolean
    start?: boolean
    EXPERIMENTAL?: {
        ipnsPubsub?: boolean
        sharding?: boolean
    }
    repo?: string
    config?: any
}

type AddOptions = {
    chunker?: string // chunking algorithm used to build ipfs DAGs
    cidVersion?: number // the CID version to use when storing the data
    hashAlg?: string // multihash hashing algorithm to use
    onlyHash?: boolean // If true, will not add blocks to the blockstore
    pin?: boolean
    progress?: Function // a function that will be called with the byte length of chunks as a file is added to ipfs
    rawLeaves?: boolean // if true, DAG leaves will contain raw file data and not be wrapped in a protobuf
    trickle?: boolean // if true will use the trickle DAG format for DAG generation
    wrapWithDirectory?: boolean // Adds a wrapping node around the content
    timeout?: number
    signal?: AbortSignal
}

interface Multiaddr {
    buffer: Uint8Array;
}

type Multihash = any | string;

interface Types {
    Buffer: any;
    PeerId: any;
    PeerInfo: any;
    multiaddr: Multiaddr;
    multihash: Multihash;
    CID: CID;
}

interface Version {
    version: string;
    repo: string;
    commit: string;
}

interface Id {
    id: string;
    publicKey: string;
    addresses: Multiaddr[];
    agentVersion: string;
    protocolVersion: string;
}

interface RepoAPI {
    gc(): void;
    path(): string;
}

type FileContent = Uint8Array | Blob | String | Iterable<Uint8Array> | Iterable<number> | AsyncIterable<Uint8Array> | ReadableStream<Uint8Array>

interface FileObject {
    path?: string;
    mode?: number | string;
    mtime?: UnixTime;
    content?: FileContent;
}

type FileStream = Iterable<FileContent|FileObject> | AsyncIterable<FileContent|FileObject> | ReadableStream<FileContent|FileObject>

type UnixTime = Date | UnixTimeObj | number[]

interface UnixTimeObj {
    secs: number // the number of seconds since (positive) or before (negative) the Unix Epoch began
    nsecs?: number // the number of nanoseconds since the last full second.
}

interface UnixFSEntry {
    path: string
    cid: CID
    mode: number
    mtime: UnixTimeObj
    size: number
}
interface IPFSFileInfo {
    depth: number
    name: string
    path: string
    size: number
    cid: CID
    type: 'file'
    mode: number
    mtime: UnixTimeObj
}

interface FilesAPI {
    cp: any
    flush: any
    ls: any
    lsReadableStream: any
    lsPullStream: any
    mkdir: any
    mv: any
    read: any
    readPullStream: any
    readReadableStream: any
    rm: any
    stat: any
    write: any
}

interface PeersOptions {
    v?: boolean;
    verbose?: boolean;
}

type PeerId = any;

interface PeerInfo {
    id: PeerId;
    multiaddr: Multiaddr;
    multiaddrs: Multiaddr[];
    distinctMultiaddr(): Multiaddr[];
}

interface Peer {
    addr: Multiaddr;
    peer: PeerInfo;
}

interface SwarmAPI {
    peers(options: PeersOptions): Promise<Peer[]>
    peers(): Promise<Peer[]>

    addrs(): Promise<PeerInfo[]>

    localAddrs(): Promise<Multiaddr[]>

    connect(maddr: Multiaddr | string): Promise<any>

    disconnect(maddr: Multiaddr | string): Promise<any>
}

type DAGNode = any
type DAGLink = any
type DAGLinkRef = DAGLink | any
type Obj = BufferSource | Object

interface ObjectStat {
    Hash: Multihash;
    NumLinks: number;
    BlockSize: number;
    LinksSize: number;
    DataSize: number;
    CumulativeSize: number;
}

interface PutObjectOptions {
    enc?: any;
}

interface GetObjectOptions {
    enc?: any;
}

interface ObjectPatchAPI {
    addLink(multihash: Multihash, link: DAGLink, options: GetObjectOptions): Promise<any>;
    addLink(multihash: Multihash, link: DAGLink): Promise<any>;

    rmLink(multihash: Multihash, linkRef: DAGLinkRef, options: GetObjectOptions): Promise<any>;
    rmLink(multihash: Multihash, linkRef: DAGLinkRef): Promise<any>;

    appendData(multihash: Multihash, data: any, options: GetObjectOptions): Promise<any>;
    appendData(multihash: Multihash, data: any): Promise<any>;

    setData(multihash: Multihash, data: any, options: GetObjectOptions): Promise<any>;
    setData(multihash: Multihash, data: any): Promise<any>;
}

interface ObjectAPI {
    "new"(): Promise<DAGNode>;

    put(obj: Obj, options: PutObjectOptions): Promise<any>;
    put(obj: Obj): Promise<any>;

    get(multihash: Multihash, options: GetObjectOptions): Promise<any>;
    get(multihash: Multihash): Promise<any>;

    data(multihash: Multihash, options: GetObjectOptions): Promise<any>;
    data(multihash: Multihash): Promise<any>;

    links(multihash: Multihash, options: GetObjectOptions): Promise<DAGLink[]>;
    links(multihash: Multihash): Promise<DAGLink[]>;

    stat(multihash: Multihash, options: GetObjectOptions): Promise<ObjectStat>;
    stat(multihash: Multihash): Promise<ObjectStat>;

    patch: ObjectPatchAPI;
}

interface DagAPI {
    put(dagNode: any, options: any): Promise<any>;

    get(cid: string | CID, path: string, options: any): Promise<any>;
    get(cid: string | CID, path: string): Promise<any>;
    get(cid: string | CID): Promise<any>;

    tree(cid: string | CID, path: string, options: any): Promise<any>;
    tree(cid: string | CID, path: string): Promise<any>;
    tree(cid: string | CID, options: any): Promise<any>;
    tree(cid: string | CID): Promise<any>;
}